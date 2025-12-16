// SumiNav - Windows 98风格导航页

// 导入默认链接配置和应用配置
import { defaultLinks } from './default-links.js';
import { appConfig } from './config.js';

// 全局变量
let links = [];
let currentEditingLink = null;
let draggedElement = null;
let currentViewMode = 'grid'; // 'grid' 或 'list'
let activeCategory = '全部'; // 当前选中的分类

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // 加载本地存储的数据
    loadLinks();
    const settings = loadSettings();
    
    // 应用设置
    applySettings(settings);
    
    // 设置事件监听器
    setupEventListeners();
    
    // 更新时间
    updateTime();
    setInterval(updateTime, appConfig.time.updateInterval);
    
    // 渲染分类标签和桌面图标
    renderCategoryTabs();
    renderDesktopIcons();
}

// 设置事件监听器
function setupEventListeners() {
    // 开始菜单
    document.getElementById('start-button').addEventListener('click', toggleStartMenu);
    document.getElementById('taskbar-start').addEventListener('click', toggleStartMenu);
    
    // GitHub项目按钮
    document.getElementById('github-project-btn').addEventListener('click', () => {
        window.open(appConfig.githubProjectUrl, '_blank');
    });
    
    // 开始菜单项
    document.getElementById('add-link-btn').addEventListener('click', () => {
        closeStartMenu();
        currentEditingLink = null;
        openAddLinkDialog();
    });
    
    document.getElementById('toggle-view-btn').addEventListener('click', () => {
        closeStartMenu();
        toggleViewMode();
    });
    
    
    document.getElementById('settings-btn').addEventListener('click', () => {
        closeStartMenu();
        openSettingsDialog();
    });
    
    document.getElementById('help-btn').addEventListener('click', () => {
        closeStartMenu();
        openHelpDialog();
    });
    
    document.getElementById('about-btn').addEventListener('click', () => {
        closeStartMenu();
        openAboutDialog();
    });
    
    document.getElementById('reset-btn').addEventListener('click', () => {
        closeStartMenu();
        resetApp();
    });
    
    // 壁纸选择事件监听器
    document.getElementById('wallpaper-select').addEventListener('change', function() {
        const customWallpaperGroup = document.getElementById('custom-wallpaper-group');
        customWallpaperGroup.style.display = this.value === 'custom' ? 'block' : 'none';
    });
    
    // 对话框关闭
    document.getElementById('close-dialog').addEventListener('click', closeAddLinkDialog);
    document.getElementById('cancel-btn').addEventListener('click', closeAddLinkDialog);
    
    // URL输入框事件监听，自动获取图标
    document.getElementById('link-url').addEventListener('blur', fetchFavicon);
    document.getElementById('link-url').addEventListener('change', fetchFavicon);
    
    document.getElementById('close-settings-btn').addEventListener('click', closeSettingsDialog);
    document.getElementById('cancel-settings-btn').addEventListener('click', closeSettingsDialog);
    
    document.getElementById('close-help').addEventListener('click', closeHelpDialog);
    document.getElementById('close-help-btn').addEventListener('click', closeHelpDialog);
    
    document.getElementById('close-about').addEventListener('click', closeAboutDialog);
    document.getElementById('close-about-btn').addEventListener('click', closeAboutDialog);
    

    
    // 保存按钮
    document.getElementById('save-btn').addEventListener('click', saveLink);
    document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
    
    // 遮罩层点击关闭对话框
    document.getElementById('overlay').addEventListener('click', () => {
        closeAllDialogs();
        closeStartMenu();
        closeContextMenu();
    });
    
    // 右键菜单
    document.addEventListener('contextmenu', (e) => {
        if (e.target.closest('.desktop-icon')) {
            e.preventDefault();
            showContextMenu(e);
        }
    });
    
    // 右键菜单项
    document.getElementById('edit-link').addEventListener('click', editLink);
    document.getElementById('delete-link').addEventListener('click', deleteLink);
    
    // 点击空白处关闭右键菜单
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.context-menu')) {
            closeContextMenu();
        }
    });
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllDialogs();
            closeStartMenu();
            closeContextMenu();
        }
    });
}

function closeStartMenu() {
    document.getElementById('start-menu').classList.add('hidden');
}

// 对话框功能
function openAddLinkDialog() {
    const dialog = document.getElementById('add-link-dialog');
    const overlay = document.getElementById('overlay');
    
    // 清空或填充表单
    if (currentEditingLink) {
        document.getElementById('link-name').value = currentEditingLink.name;
        document.getElementById('link-url').value = currentEditingLink.url;
        document.getElementById('link-icon').value = currentEditingLink.icon;
        document.getElementById('link-category').value = currentEditingLink.category;
    } else {
        // 直接重置各个输入字段，因为对话框中没有form标签
        document.getElementById('link-name').value = '';
        document.getElementById('link-url').value = '';
        document.getElementById('link-icon').value = appConfig.links.defaultIcon;
        document.getElementById('link-category').value = appConfig.links.defaultCategory;
    }
    
    dialog.classList.remove('hidden');
    overlay.classList.remove('hidden');
    
    // 聚焦到第一个输入框
    document.getElementById('link-name').focus();
}

function closeAddLinkDialog() {
    document.getElementById('add-link-dialog').classList.add('hidden');
    document.getElementById('overlay').classList.add('hidden');
    currentEditingLink = null;
}

function openSettingsDialog() {
    document.getElementById('settings-dialog').classList.remove('hidden');
    document.getElementById('overlay').classList.remove('hidden');
}

function closeSettingsDialog() {
    document.getElementById('settings-dialog').classList.add('hidden');
    document.getElementById('overlay').classList.add('hidden');
}





function openHelpDialog() {
    document.getElementById('help-dialog').classList.remove('hidden');
    document.getElementById('overlay').classList.remove('hidden');
}

function closeHelpDialog() {
    document.getElementById('help-dialog').classList.add('hidden');
    document.getElementById('overlay').classList.add('hidden');
}

function openAboutDialog() {
    document.getElementById('about-dialog').classList.remove('hidden');
    document.getElementById('overlay').classList.remove('hidden');
}

function closeAboutDialog() {
    document.getElementById('about-dialog').classList.add('hidden');
    document.getElementById('overlay').classList.add('hidden');
}

// 重置应用到默认状态
function resetApp() {
    if (confirm('确定要重置所有设置和链接吗？此操作不可恢复。')) {
        // 清除localStorage中的所有数据
        localStorage.removeItem('suminav-links');
        localStorage.removeItem('suminav-settings');
        
        // 重新加载默认链接
        links = [...defaultLinks];
        saveLinks();
        
        // 重新加载默认设置
        const settings = loadSettings();
        applySettings(settings);
        
        // 重新渲染桌面图标
        renderDesktopIcons();
        
        // 提示用户重置成功
        alert('应用已成功重置到默认状态！');
    }
}

function closeAllDialogs() {
    closeAddLinkDialog();
    closeSettingsDialog();
    closeHelpDialog();
    closeAboutDialog();
}

// 右键菜单功能
function showContextMenu(event) {
    const contextMenu = document.getElementById('context-menu');
    const desktopIcon = event.target.closest('.desktop-icon');
    
    if (desktopIcon) {
        // 保存当前选中的链接ID
        window.currentLinkId = desktopIcon.dataset.id;
        
        // 计算菜单位置
        let x = event.clientX;
        let y = event.clientY;
        
        // 确保菜单不会超出屏幕
        if (x + contextMenu.offsetWidth > window.innerWidth) {
            x = window.innerWidth - contextMenu.offsetWidth;
        }
        if (y + contextMenu.offsetHeight > window.innerHeight) {
            y = window.innerHeight - contextMenu.offsetHeight;
        }
        
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        contextMenu.classList.remove('hidden');
    }
}

function closeContextMenu() {
    document.getElementById('context-menu').classList.add('hidden');
    window.currentLinkId = null;
}

// 链接管理功能
function saveLink() {
    const name = document.getElementById('link-name').value.trim();
    const url = document.getElementById('link-url').value.trim();
    const icon = document.getElementById('link-icon').value.trim() || '📂';
    const category = document.getElementById('link-category').value;
    
    if (!name || !url) {
        alert('请填写名称和URL');
        return;
    }
    
    // 验证URL格式
    try {
        new URL(url);
    } catch (e) {
        alert('请输入有效的URL格式（例如：https://example.com）');
        return;
    }
    
    if (currentEditingLink) {
        // 更新现有链接
        const linkIndex = links.findIndex(link => link.id === currentEditingLink.id);
        if (linkIndex !== -1) {
            links[linkIndex] = {
                ...links[linkIndex],
                name,
                url,
                icon,
                category,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        // 添加新链接
        const newLink = {
            id: Date.now().toString(),
            name,
            url,
            icon,
            category,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        links.push(newLink);
    }
    
    // 保存到本地存储
    saveLinks();
    
    // 重新渲染桌面图标
    renderDesktopIcons();
    
    // 关闭对话框
    closeAddLinkDialog();
}

function editLink() {
    if (!window.currentLinkId) return;
    
    const link = links.find(link => link.id === window.currentLinkId);
    if (link) {
        currentEditingLink = link;
        openAddLinkDialog();
    }
    
    closeContextMenu();
}

function deleteLink() {
    if (!window.currentLinkId) return;
    
    if (confirm('确定要删除这个链接吗？')) {
        links = links.filter(link => link.id !== window.currentLinkId);
        saveLinks();
        renderDesktopIcons();
    }
    
    closeContextMenu();
}

// 渲染分类标签
function renderCategoryTabs() {
    const categoryTabsContainer = document.getElementById('category-tabs');
    if (!categoryTabsContainer) return;
    
    categoryTabsContainer.innerHTML = '';
    
    // 获取所有分类（从配置文件获取基础分类，然后合并链接中的分类）
    const linkCategories = [...new Set(links.map(link => link.category))];
    const configCategories = appConfig.links.categories || [];
    // 合并分类并去重，保持配置文件中的顺序
    const categories = ['全部', ...new Set([...configCategories, ...linkCategories])];
    
    categories.forEach(category => {
        const tab = document.createElement('button');
        tab.className = `category-tab ${category === activeCategory ? 'active' : ''}`;
        tab.textContent = category;
        tab.addEventListener('click', () => {
            activeCategory = category;
            renderCategoryTabs();
            renderDesktopIcons();
        });
        categoryTabsContainer.appendChild(tab);
    });
}

// 渲染桌面图标
function renderDesktopIcons() {
    const desktop = document.getElementById('desktop');
    desktop.innerHTML = '';
    
    // 应用当前视图模式
    if (currentViewMode === 'list') {
        desktop.classList.add('list-view');
    } else {
        desktop.classList.remove('list-view');
    }
    
    // 过滤显示的链接
    const filteredLinks = activeCategory === '全部' 
        ? links 
        : links.filter(link => link.category === activeCategory);
    
    filteredLinks.forEach(link => {
        const iconElement = createDesktopIcon(link);
        desktop.appendChild(iconElement);
    });
}

// 切换视图模式
function toggleViewMode() {
    currentViewMode = currentViewMode === 'grid' ? 'list' : 'grid';
    renderDesktopIcons();
    saveSettings(); // 自动保存当前视图模式
}

// 创建桌面图标
function createDesktopIcon(link) {
    const iconDiv = document.createElement('div');
    iconDiv.className = 'desktop-icon';
    iconDiv.dataset.id = link.id;
    
    // 添加拖拽功能
    iconDiv.draggable = true;
    iconDiv.addEventListener('dragstart', handleDragStart);
    iconDiv.addEventListener('dragend', handleDragEnd);
    iconDiv.addEventListener('dragover', handleDragOver);
    iconDiv.addEventListener('drop', handleDrop);
    
    // 移动端触摸事件支持
    let longPressTimer;
    let touchStartX;
    let touchStartY;
    
    // 触摸开始
    iconDiv.addEventListener('touchstart', (e) => {
        e.preventDefault(); // 防止滚动
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        
        // 设置长按定时器
        longPressTimer = setTimeout(() => {
            draggedElement = iconDiv;
            iconDiv.classList.add('dragging');
        }, appConfig.desktop.longPressDuration); // 长按触发时间
    });
    
    // 触摸移动
    iconDiv.addEventListener('touchmove', (e) => {
        e.preventDefault();
        
        // 如果正在拖动
        if (draggedElement) {
            // 这里可以添加视觉反馈，但实际位置由drop事件处理
        }
        
        // 移动距离超过阈值，取消长按
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const distance = Math.sqrt(
            Math.pow(touchX - touchStartX, 2) + 
            Math.pow(touchY - touchStartY, 2)
        );
        
        if (distance > appConfig.desktop.dragThreshold && longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    });
    
    // 触摸结束
    iconDiv.addEventListener('touchend', (e) => {
        e.preventDefault();
        
        // 清除长按定时器
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
            
            // 短按打开链接
            window.open(link.url, '_blank');
        }
        
        // 结束拖动
        if (draggedElement) {
            iconDiv.classList.remove('dragging');
            draggedElement = null;
        }
    });
    
    // 点击打开链接
    iconDiv.addEventListener('click', () => {
        window.open(link.url, '_blank');
    });
    
    // 图标内容
    let iconContent;
    if (link.icon.startsWith('http://') || link.icon.startsWith('https://')) {
        // 如果是URL图标，使用img标签显示
        iconContent = `<img src="${link.icon}" alt="${link.name}" class="icon-content">`;
    } else {
        // 否则显示emoji
        iconContent = `<span class="icon-content">${link.icon}</span>`;
    }
    
    iconDiv.innerHTML = `
        <div class="icon-container">
            ${iconContent}
        </div>
        <div class="label-container">
            <span class="icon-label">${link.name}</span>
        </div>
    `;
    
    return iconDiv;
}

// 拖拽功能
function handleDragStart(e) {
    draggedElement = e.target.closest('.desktop-icon');
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedElement = null;
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    const targetElement = e.target.closest('.desktop-icon');
    
    if (draggedElement && targetElement && draggedElement !== targetElement) {
        const draggedId = draggedElement.dataset.id;
        const targetId = targetElement.dataset.id;
        
        const draggedIndex = links.findIndex(link => link.id === draggedId);
        const targetIndex = links.findIndex(link => link.id === targetId);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
            // 重新排序链接
            const [movedLink] = links.splice(draggedIndex, 1);
            links.splice(targetIndex, 0, movedLink);
            
            // 保存并重新渲染
            saveLinks();
            renderDesktopIcons();
        }
    }
}

// 设置功能
function saveSettings() {
    const wallpaperSelect = document.getElementById('wallpaper-select');
    const customWallpaperInput = document.getElementById('custom-wallpaper');
    const taskbarPositionSelect = document.getElementById('taskbar-position');
    
    const wallpaper = wallpaperSelect ? wallpaperSelect.value : 'default';
    const customWallpaper = wallpaper === 'custom' && customWallpaperInput ? customWallpaperInput.value : '';
    const taskbarPosition = taskbarPositionSelect ? taskbarPositionSelect.value : 'bottom';
    
    // 保存设置
    const settings = {
        wallpaper,
        customWallpaper,
        taskbarPosition,
        viewMode: currentViewMode, // 保存当前视图模式
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('suminav-settings', JSON.stringify(settings));
    
    // 应用设置
    applySettings(settings);
    
    // 如果有设置对话框则关闭
    if (document.getElementById('settings-dialog')) {
        closeSettingsDialog();
    }
}



function applySettings(settings) {
    const body = document.body;
    const taskbar = document.getElementById('taskbar');
    const desktop = document.getElementById('desktop');
    
    // 移除所有壁纸类
    body.classList.remove('wallpaper-blue', 'wallpaper-green', 'wallpaper-purple');
    
    // 应用壁纸设置
    if (settings.wallpaper) {
        if (settings.wallpaper === 'custom' && settings.customWallpaper) {
            body.style.backgroundImage = `url(${settings.customWallpaper})`;
            body.style.backgroundSize = 'cover';
            body.style.backgroundPosition = 'center';
        } else if (settings.wallpaper !== 'default') {
            body.classList.add(`wallpaper-${settings.wallpaper}`);
            body.style.backgroundImage = '';
        } else {
            body.style.backgroundImage = '';
        }
    }
    
    // 应用任务栏位置设置
    if (settings.taskbarPosition) {
        // 移除所有位置类
        taskbar.classList.remove('top', 'bottom');
        // 添加当前位置类
        taskbar.classList.add(settings.taskbarPosition);
    } else {
        // 默认在底部
        taskbar.classList.remove('top');
        taskbar.classList.add('bottom');
    }
    
    // 应用视图模式设置
    if (settings.viewMode) {
        currentViewMode = settings.viewMode;
        // 更新桌面视图类
        if (currentViewMode === 'list') {
            desktop.classList.add('list-view');
        } else {
            desktop.classList.remove('list-view');
        }
    }
}

// 开始菜单功能
function toggleStartMenu() {
    const startMenu = document.getElementById('start-menu');
    const taskbar = document.getElementById('taskbar');
    
    if (startMenu.classList.contains('hidden')) {
        startMenu.classList.remove('hidden');
        
        // 根据任务栏位置调整开始菜单位置
        const taskbarPosition = taskbar.classList.contains('top') ? 'top' : 'bottom';
        if (taskbarPosition === 'top') {
            startMenu.style.bottom = 'auto';
            startMenu.style.top = `${taskbar.offsetHeight}px`;
        } else {
            startMenu.style.top = 'auto';
            startMenu.style.bottom = `${taskbar.offsetHeight}px`;
        }
    } else {
        startMenu.classList.add('hidden');
    }
}

// 更新网站运行时间
function updateTime() {
    // 从配置文件中获取启动时间
    let startTime = new Date(appConfig.startupTime);
    
    // 确保startupTime是有效的日期
    if (isNaN(startTime.getTime())) {
        startTime = new Date(); // 如果无效，使用当前时间
    }
    
    const now = new Date();
    
    // 计算运行时间差值（毫秒）
    const diffMs = now - startTime;
    
    // 转换为小时、分钟、秒
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    // 格式化时间字符串
    const timeString = `${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}:${diffSeconds.toString().padStart(2, '0')}`;
    
    // 更新显示
    document.getElementById('current-time').textContent = `运行时间 ${timeString}`;
    document.getElementById('taskbar-time').textContent = timeString;
}

// 本地存储功能
function saveLinks() {
    localStorage.setItem('suminav-links', JSON.stringify(links));
}

function loadLinks() {
    const savedLinks = localStorage.getItem('suminav-links');
    if (savedLinks) {
        links = JSON.parse(savedLinks);
    } else {
        // 使用导入的默认链接配置
        links = [...defaultLinks];
        saveLinks();
    }
}

function loadSettings() {
    const savedSettings = localStorage.getItem('suminav-settings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        // 更新设置对话框的值
        document.getElementById('wallpaper-select').value = settings.wallpaper || 'default';
        document.getElementById('taskbar-position').value = settings.taskbarPosition || 'bottom';
        
        // 更新自定义壁纸输入框
        if (settings.wallpaper === 'custom') {
            document.getElementById('custom-wallpaper-group').style.display = 'block';
            document.getElementById('custom-wallpaper').value = settings.customWallpaper || '';
        }
        
        return settings;
    } else {
        // 返回默认设置（从配置文件获取）
        const defaultSettings = {
            viewMode: appConfig.view.defaultMode,
            wallpaper: appConfig.desktop.defaultWallpaper,
            customWallpaper: appConfig.desktop.customWallpaper,
            taskbarPosition: appConfig.desktop.taskbarPosition
        };
        
        return defaultSettings;
    }
}

// 重置应用


// 工具函数
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// 自动获取网站图标
function fetchFavicon() {
    const urlInput = document.getElementById('link-url');
    const iconInput = document.getElementById('link-icon');
    const url = urlInput.value.trim();
    
    if (!url) return;
    
    try {
        const parsedUrl = new URL(url);
        // 使用Google Favicon Service获取图标URL
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${parsedUrl.origin}&sz=64`;
        
        // 检查favicon是否存在
        const img = new Image();
        img.onload = function() {
            // 保存图标URL作为图标值
            iconInput.value = faviconUrl;
        };
        img.onerror = function() {
            // 如果获取失败，保持默认图标
            console.log('无法获取网站图标，使用默认图标');
        };
        img.src = faviconUrl;
    } catch (e) {
        // URL格式错误，不处理
    }
}

// 响应式处理
// 窗口大小变化事件处理
let lastWindowHeight = window.innerHeight;
window.addEventListener('resize', () => {
    const currentHeight = window.innerHeight;
    
    // 检测是否是手机端输入法导致的窗口高度变化
    // 当输入法弹出时，通常窗口高度会减少，而宽度不变
    const isKeyboardShown = currentHeight < lastWindowHeight;
    
    // 仅在不是输入法导致的窗口变化时关闭菜单和对话框
    if (!isKeyboardShown) {
        closeStartMenu();
        closeContextMenu();
    }
    
    // 更新最后窗口高度
    lastWindowHeight = currentHeight;
});

// 导出全局函数（用于调试）
window.sumiNav = {
    links,
    loadLinks,
    saveLinks,
    renderDesktopIcons
};