// 窗口配置文件
// 存放所有窗口相关的配置和HTML结构
export const windowConfig = {
    // 开始菜单配置
    startMenu: {
        html: `
            <div class="start-menu-header">
                <img src="/favicon.ico">
                <span>SumiNav</span>
            </div>
            <div class="start-menu-items">
                <!-- 菜单项将通过JavaScript动态生成 -->
            </div>
            <div class="start-menu-footer">
                <span id="current-time">12:00</span>
            </div>
        `
    },

    // 任务栏配置
    taskbar: {
        html: `
            <div class="taskbar-left">
                <button id="taskbar-start" class="taskbar-button">🪟开始</button>
            </div>
            <div class="taskbar-center">
                <!-- 分类标签将通过JavaScript动态生成 -->
                <div id="category-tabs" class="category-tabs"></div>
                <!-- 分类菜单按钮（小屏幕显示） -->
                <div class="category-menu-container">
                    <button id="category-menu-btn" class="taskbar-button category-menu-btn">分类菜单 ▼</button>
                    <div id="category-dropdown" class="category-dropdown hidden"></div>
                </div>
                <!-- 任务将通过JavaScript动态生成 -->
                <button id="github-project-btn" class="taskbar-button">此主题的Github项目</button>
            </div>
            <div class="taskbar-right">
                <span id="taskbar-time">运行时间</span>
            </div>
        `
    },

    // 添加链接对话框配置
    addLinkDialog: {
        html: `
            <div class="dialog-header">
                <span class="dialog-title">添加新链接</span>
                <button id="close-dialog" class="dialog-close-btn">×</button>
            </div>
            <div class="dialog-content">
                <div class="form-group">
                    <label for="link-name">名称:</label>
                    <input type="text" id="link-name" placeholder="输入链接名称" required>
                </div>
                <div class="form-group">
                    <label for="link-url">URL:</label>
                    <input type="url" id="link-url" placeholder="https://example.com" required>
                </div>
                <div class="form-group">
                    <label for="link-icon">图标:</label>
                    <input type="text" id="link-icon" placeholder="📂" value="📂">
                </div>
                <div class="form-group">
                    <label for="link-category">分类:</label>
                    <select id="link-category">
                        <!-- 分类选项将通过 JavaScript 动态生成 -->
                    </select>
                </div>
            </div>
            <div class="dialog-footer">
                <button id="cancel-btn" class="button">取消</button>
                <button id="save-btn" class="button primary">保存</button>
            </div>
        `
    },

    // 设置对话框配置
    settingsDialog: {
        html: `
            <div class="dialog-header">
                <span class="dialog-title">设置</span>
                <button id="close-settings-btn" class="dialog-close-btn">×</button>
            </div>
            <div class="dialog-content">
                <div class="setting-group">
                    <label for="wallpaper-select">桌面壁纸:</label>
                    <select id="wallpaper-select">
                        <option value="default">默认</option>
                        <option value="green">绿色</option>
                        <option value="blue">蓝色</option>
                        <option value="custom">自定义</option>
                    </select>
                </div>

                <div class="setting-group" id="custom-wallpaper-group" style="display: none;">
                    <label for="custom-wallpaper">自定义壁纸URL:</label>
                    <input type="text" id="custom-wallpaper" placeholder="输入壁纸URL">
                </div>

                <div class="setting-group">
                    <label for="taskbar-position">任务栏位置:</label>
                    <select id="taskbar-position">
                        <option value="bottom">底部</option>
                        <option value="top">顶部</option>
                    </select>
                </div>

                <div class="setting-group">
                    
                </div>
            </div>
            <div class="dialog-footer">
                <button id="cancel-settings-btn" class="dialog-btn">取消</button>
                <button id="save-settings-btn" class="dialog-btn primary">保存</button>
            </div>
        `
    },

    // 帮助对话框配置
    helpDialog: {
        html: `
            <div class="dialog-header">
                <span class="dialog-title">帮助</span>
                <button id="close-help" class="dialog-close-btn">×</button>
            </div>
            <div class="dialog-content">
                <p>SumiNav使用说明:</p>
                <ul>
                    <li>点击「开始」按钮添加新链接</li>
                    <li>拖拽图标可以重新排列</li>
                    <li>右键点击图标可以编辑或删除</li>
                    <li>所有设置将保存在本地</li>
                </ul>
            </div>
            <div class="dialog-footer">
                <button id="close-help-btn" class="button primary">确定</button>
            </div>
        `
    },

    // 关于对话框配置
    aboutDialog: {
        html: `
            <div class="dialog-header">
                <span class="dialog-title">关于 SumiNav</span>
                <button id="close-about" class="dialog-close-btn">×</button>
            </div>
            <div class="dialog-content">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="/favicon.ico" alt="SumiNav Logo" style="width: 64px; height: 64px;">
                    <h2>SumiNav</h2>
                </div>
                <p>版本: 1.1.0</p>
                <p>Windows 98风格的导航页应用</p>
                <p>© 2025 Supermini233. 保留所有权利。</p>
                <p>设计灵感来源于经典的Windows 98界面风格，使用了98.css样式，初期版本bug还很多</p>
            </div>
            <div class="dialog-footer">
                <button id="close-about-btn" class="button primary">确定</button>
            </div>
        `
    },

    // 右键菜单配置
    contextMenu: {
        html: `
            <button id="edit-link" class="context-menu-item">编辑</button>
            <button id="delete-link" class="context-menu-item">删除</button>
        `
    },

    // 遮罩层配置
    overlay: {
        html: ``
    }
};
