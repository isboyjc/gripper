/**
 * Background Service Worker
 * 每个 Tab 独立状态管理
 */

// 图标路径配置
const ICONS = {
  // 默认状态 - 黑色背景白色图标
  default: {
    16: 'icons/icon-16.png',
    32: 'icons/icon-32.png',
    48: 'icons/icon-48.png',
    128: 'icons/icon-128.png',
  },
  // 开启状态 - 绿色背景白色图标
  active: {
    16: 'icons/icon-16-active.png',
    32: 'icons/icon-32-active.png',
    48: 'icons/icon-48-active.png',
    128: 'icons/icon-128-active.png',
  },
}

// 存储每个 tab 的启用状态（使用 chrome.storage.session 持久化）
// 注意：使用 session storage 在页面刷新时保持状态，但关闭标签页时清除

// 获取 tab 状态
async function getTabState(tabId: number): Promise<boolean> {
  const key = `tabState_${tabId}`
  const result = await chrome.storage.session.get([key])
  return (result[key] as boolean | undefined) ?? false
}

// 设置 tab 状态
async function setTabState(tabId: number, enabled: boolean) {
  const key = `tabState_${tabId}`
  await chrome.storage.session.set({ [key]: enabled })
}

// 清理 tab 状态
async function clearTabState(tabId: number) {
  const key = `tabState_${tabId}`
  await chrome.storage.session.remove([key])
}

// 更新指定 tab 的图标
async function updateTabIcon(tabId: number, enabled: boolean) {
  const icons = enabled ? ICONS.active : ICONS.default
  // 使用完整路径
  const iconPath = {
    16: chrome.runtime.getURL(icons[16]),
    32: chrome.runtime.getURL(icons[32]),
    48: chrome.runtime.getURL(icons[48]),
    128: chrome.runtime.getURL(icons[128]),
  }
  try {
    await chrome.action.setIcon({ tabId, path: iconPath })
    console.log(`[Gripper] Tab ${tabId} icon updated:`, enabled ? 'active' : 'default')
  } catch (error) {
    console.error(`[Gripper] Failed to update icon for tab ${tabId}:`, error)
  }
}

chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Gripper] Extension installed:', details.reason)
  chrome.storage.local.set({ theme: 'system' })
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false })
})

// 监听 tab 关闭，清理状态
chrome.tabs.onRemoved.addListener((tabId) => {
  clearTabState(tabId)
  console.log(`[Gripper] Tab ${tabId} closed, state cleared`)
})

// 监听 tab 更新（页面导航时处理状态）
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    // 页面开始加载时，保持状态不变（不重置）
    console.log(`[Gripper] Tab ${tabId} navigating, state preserved`)
  } else if (changeInfo.status === 'complete') {
    // 页面加载完成后，恢复插件状态
    const wasEnabled = await getTabState(tabId)
    if (wasEnabled) {
      // 如果之前是启用状态，重新启用插件
      try {
        await chrome.tabs.sendMessage(tabId, { type: 'ENABLE_EXTENSION' })
        await updateTabIcon(tabId, true)
        console.log(`[Gripper] Tab ${tabId} loaded, extension re-enabled`)
      } catch (error) {
        console.error(`[Gripper] Failed to re-enable extension on tab ${tabId}:`, error)
      }
    }
  }
})

// 监听 tab 激活（切换标签页时同步图标状态）
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const { tabId } = activeInfo
  const enabled = await getTabState(tabId)
  await updateTabIcon(tabId, enabled)
  console.log(`[Gripper] Tab ${tabId} activated, icon synced:`, enabled ? 'active' : 'default')
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Gripper Background] Message received:', message)

  switch (message.type) {
    case 'TOGGLE_EXTENSION':
      handleToggleExtension(message.tabId, message.payload, sendResponse, true)
      return true
    case 'DISABLE_EXTENSION':
      if (sender.tab?.id) {
        // 从 content script 发来的禁用请求，不需要回传消息
        handleToggleExtension(sender.tab.id, false, sendResponse, false)
      } else {
        sendResponse({ success: false, error: 'No tab id' })
      }
      return true
    case 'GET_TAB_STATE':
      handleGetTabState(message.tabId, sendResponse)
      return true
    case 'GET_STATE':
      handleGetState(message.tabId, sendResponse)
      return true
    case 'THEME_CHANGE':
      handleThemeChange(message.payload, sendResponse)
      return true
    case 'LOCALE_CHANGE':
      handleLocaleChange(message.payload, sendResponse)
      return true
    case 'OPEN_SIDE_PANEL':
      handleOpenSidePanel(sender.tab?.id, sendResponse)
      return true
    case 'CLOSE_SIDEPANEL':
    case 'CLOSE_SIDE_PANEL':
      if (message.tabId) {
        chrome.storage.local.remove([`selectedElementInfo_${message.tabId}`])
      }
      sendResponse({ success: true })
      return true
    case 'ELEMENT_SELECTED':
      handleElementSelected(sender.tab?.id, message.payload, sendResponse)
      return true
    case 'GET_SELECTED_ELEMENT':
      handleGetSelectedElement(message.tabId, sendResponse)
      return true
    case 'CAPTURE_FOR_EYEDROPPER':
      handleCaptureForEyedropper(sender.tab?.windowId, sendResponse)
      return true
    case 'TAKE_SCREENSHOT':
      handleTakeScreenshot(sender.tab?.id, sender.tab?.windowId, message.payload, sendResponse)
      return true
    case 'DOWNLOAD_SCREENSHOT':
      handleDownloadScreenshot(message.payload, sendResponse)
      return true
    default:
      sendResponse({ success: false, error: 'Unknown message type' })
  }
})

async function handleToggleExtension(tabId: number, enabled: boolean, sendResponse: (response: unknown) => void, shouldNotifyTab: boolean = true) {
  if (!tabId) {
    sendResponse({ success: false, error: 'No tab id' })
    return
  }

  // 更新该 tab 的状态
  await setTabState(tabId, enabled)

  // 更新该 tab 的图标
  await updateTabIcon(tabId, enabled)

  // 如果禁用，清理该 tab 的选中元素信息
  if (!enabled) {
    await chrome.storage.local.remove([`selectedElementInfo_${tabId}`])
  }

  // 只在需要时通知当前 tab
  if (shouldNotifyTab) {
    try {
      await chrome.tabs.sendMessage(tabId, { type: enabled ? 'ENABLE_EXTENSION' : 'DISABLE_EXTENSION' })
    } catch (error) {
      console.error(`[Gripper] Failed to send message to tab ${tabId}:`, error)
    }
  }

  sendResponse({ success: true })
}

async function handleGetTabState(tabId: number, sendResponse: (response: unknown) => void) {
  const enabled = await getTabState(tabId)
  sendResponse({ success: true, data: { enabled } })
}

async function handleGetState(tabId: number | undefined, sendResponse: (response: unknown) => void) {
  const storage = await chrome.storage.local.get(['theme', 'locale'])
  const enabled = tabId ? await getTabState(tabId) : false
  const selectedElementInfo = tabId
    ? (await chrome.storage.local.get([`selectedElementInfo_${tabId}`]))[`selectedElementInfo_${tabId}`]
    : null
  sendResponse({
    success: true,
    data: {
      enabled,
      theme: storage.theme,
      locale: storage.locale,
      selectedElementInfo
    }
  })
}

async function handleThemeChange(theme: string, sendResponse: (response: unknown) => void) {
  await chrome.storage.local.set({ theme })
  const tabs = await chrome.tabs.query({})
  for (const tab of tabs) {
    if (tab.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, { type: 'THEME_CHANGED', payload: { theme } })
      } catch { /* Tab might not have content script */ }
    }
  }
  sendResponse({ success: true })
}

async function handleLocaleChange(locale: string, sendResponse: (response: unknown) => void) {
  await chrome.storage.local.set({ locale })
  const tabs = await chrome.tabs.query({})
  for (const tab of tabs) {
    if (tab.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, { type: 'LOCALE_CHANGED', payload: { locale } })
      } catch { /* Tab might not have content script */ }
    }
  }
  sendResponse({ success: true })
}

async function handleOpenSidePanel(tabId: number | undefined, sendResponse: (response: unknown) => void) {
  if (!tabId) {
    sendResponse({ success: false, error: 'No tab id' })
    return
  }
  try {
    await chrome.sidePanel.open({ tabId })
    sendResponse({ success: true })
  } catch (error) {
    console.error('[Gripper] Failed to open side panel:', error)
    sendResponse({ success: false, error: String(error) })
  }
}

async function handleElementSelected(tabId: number | undefined, payload: unknown, sendResponse: (response: unknown) => void) {
  if (tabId) {
    await chrome.storage.local.set({ [`selectedElementInfo_${tabId}`]: payload })
  }
  sendResponse({ success: true })
}

async function handleGetSelectedElement(tabId: number | undefined, sendResponse: (response: unknown) => void) {
  if (!tabId) {
    sendResponse({ success: true, data: null })
    return
  }
  const result = await chrome.storage.local.get([`selectedElementInfo_${tabId}`])
  sendResponse({ success: true, data: result[`selectedElementInfo_${tabId}`] })
}

async function handleCaptureForEyedropper(
  windowId: number | undefined,
  sendResponse: (response: unknown) => void
) {
  if (!windowId) {
    sendResponse({ success: false, error: 'No window id' })
    return
  }

  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(windowId, { format: 'png' })
    sendResponse({ success: true, data: dataUrl })
  } catch (error) {
    console.error('[Gripper] Capture for eyedropper failed:', error)
    sendResponse({ success: false, error: String(error) })
  }
}

async function handleTakeScreenshot(
  tabId: number | undefined,
  windowId: number | undefined,
  payload: { rect: { x: number; y: number; width: number; height: number } | null },
  sendResponse: (response: unknown) => void
) {
  if (!windowId || !tabId) {
    sendResponse({ success: false, error: 'No window id or tab id' })
    return
  }

  try {
    // 捕获可见区域并返回给 content script 进行处理
    const dataUrl = await chrome.tabs.captureVisibleTab(windowId, { format: 'png' })
    sendResponse({ success: true, dataUrl, hasRect: !!payload.rect })
  } catch (error) {
    console.error('[Gripper] Screenshot capture failed:', error)
    sendResponse({ success: false, error: String(error) })
  }
}

async function handleDownloadScreenshot(
  payload: { dataUrl: string; filename: string },
  sendResponse: (response: unknown) => void
) {
  console.log('[Gripper Background] Starting download:', payload.filename)
  console.log('[Gripper Background] chrome.downloads available:', !!chrome.downloads)

  try {
    // 检查 chrome.downloads API 是否可用
    if (!chrome.downloads) {
      throw new Error('chrome.downloads API is not available')
    }

    const downloadId = await downloadImage(payload.dataUrl, payload.filename)
    console.log('[Gripper Background] Download successful, ID:', downloadId)
    sendResponse({ success: true })
  } catch (error) {
    console.error('[Gripper Background] Screenshot download failed:', error)
    sendResponse({ success: false, error: String(error) })
  }
}

function downloadImage(dataUrl: string, filename: string): Promise<number> {
  return new Promise((resolve, reject) => {
    if (!chrome.downloads) {
      reject(new Error('chrome.downloads API is not available'))
      return
    }

    chrome.downloads.download(
      {
        url: dataUrl,
        filename,
        saveAs: false,
      },
      (downloadId) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(downloadId)
        }
      }
    )
  })
}

chrome.storage.onChanged.addListener((_changes, namespace) => {
  // 存储变化监听（如需要）
  if (namespace === 'local') {
    // Side Panel 会自动监听 storage 变化
  }
})

export {}
