/*
 * 作者：莲
 * 作者博客：https://blog.52lian.cc
 * 项目地址：https://github.com/52-lian/Web-Zhanqu
 * 战区查询网页版JavaScript主文件
 */

// 应用主类
class QianYueApp {
    constructor() {
        this.currentPage = 'home';
        this.appConfig = null;
        this.heroList = [];
        this.currentSwiperIndex = 0;
        this.swiperInterval = null;
        this.apiUrl = 'https://api.xxoo.team/hero/getHeroList.php';
        
        this.init();
    }

    // 初始化应用
    init() {
        this.loadAppConfig();
        this.bindEvents();
        this.loadHeroList();
    }

    // 加载应用配置
    loadAppConfig() {
        // 模拟应用配置数据
        this.appConfig = {
            config: {
                notices: "欢迎使用千月战力网页版！新功能持续更新中...",
                indexImageConvert: true
            },
            buttons: [
                {
                    title: "游戏工具",
                    icon: "fas fa-gamepad",
                    items: [
                        { title: "英雄查询", icon: "fas fa-search" },
                        { title: "战力分析", icon: "fas fa-chart-line" },
                        { title: "装备推荐", icon: "fas fa-shield-alt" },
                        { title: "符文搭配", icon: "fas fa-magic" }
                    ]
                },
                {
                    title: "实用工具",
                    icon: "fas fa-tools",
                    items: [
                        { title: "计算器", icon: "fas fa-calculator" },
                        { title: "天气查询", icon: "fas fa-cloud-sun" },
                        { title: "翻译工具", icon: "fas fa-language" },
                        { title: "二维码", icon: "fas fa-qrcode" }
                    ]
                }
            ]
        };

        this.renderToolsPage();
    }

    // 绑定事件
    bindEvents() {
        // Logo点击跳转到首页 - 全局功能
        this.bindLogoClick();
        
        // 监听DOM变化，确保动态添加的元素也能绑定事件
        const observer = new MutationObserver(() => {
            this.bindLogoClick();
        });
        observer.observe(document.body, { childList: true, subtree: true });

        // 导航切换
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.getAttribute('data-page');
                this.switchPage(page);
            });
        });

        // 搜索功能
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('hero-search');
        
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => {
                this.searchHero(searchInput.value);
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchHero(searchInput.value);
                }
            });
        }

        // 英雄类型筛选
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.getAttribute('data-type');
                this.filterHeroByType(type);
            });
        });

        // 弹窗关闭
        const popupOverlay = document.getElementById('popup');
        
        if (popupOverlay) {
            popupOverlay.addEventListener('click', (e) => {
                if (e.target === popupOverlay) {
                    this.closePopup();
                }
            });
        }

        // 回到顶部功能
        this.initBackToTop();
    }

    // Logo点击绑定方法
    bindLogoClick() {
        const logoLinks = document.querySelectorAll('.logo-link');
        logoLinks.forEach(link => {
            // 移除已存在的事件监听器，避免重复绑定
            link.removeEventListener('click', this.handleLogoClick);
            // 添加新的事件监听器
            link.addEventListener('click', this.handleLogoClick.bind(this));
        });
    }

    // Logo点击处理
    handleLogoClick(e) {
        e.preventDefault();
        e.stopPropagation();
        this.switchPage('home');
    }

    // 初始化回到顶部功能
    initBackToTop() {
        const backToTopBtn = document.getElementById('back-to-top');
        if (!backToTopBtn) return;

        // 点击回到顶部
        backToTopBtn.addEventListener('click', () => {
            this.scrollToTop();
        });

        // 监听滚动事件
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });
    }

    // 处理滚动事件
    handleScroll() {
        const backToTopBtn = document.getElementById('back-to-top');
        if (!backToTopBtn) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // 当滚动距离超过300px时显示按钮
        if (scrollTop > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }

    // 平滑滚动到顶部
    scrollToTop() {
        const scrollToTop = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > 0) {
                window.requestAnimationFrame(scrollToTop);
                window.scrollTo(0, scrollTop - scrollTop / 8);
            }
        };
        scrollToTop();
    }

    // 页面切换
    switchPage(page) {
        // 更新导航状态
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // 切换页面显示
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        document.getElementById(page).classList.add('active');

        this.currentPage = page;
    }





    // 渲染工具页
    renderToolsPage() {
        const container = document.getElementById('tools-grid');
        if (!container) return;

        container.innerHTML = '';

        this.appConfig.buttons.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'tool-category';
            categoryDiv.innerHTML = `
                <h3>
                    <i class="${category.icon}"></i>
                    ${category.title}
                </h3>
                <div class="tool-items">
                    ${category.items.map(item => `
                        <div class="tool-item" data-tool="${item.title}">
                            <i class="${item.icon}"></i>
                            <span>${item.title}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            container.appendChild(categoryDiv);
        });

        // 绑定工具点击事件
        document.querySelectorAll('.tool-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const toolName = e.currentTarget.getAttribute('data-tool');
                this.handleToolClick(toolName);
            });
        });
    }

    // 从API加载英雄列表
    async loadHeroList() {
        try {
            this.showToast('正在加载英雄数据...');
            
            const response = await fetch(this.apiUrl);
            const data = await response.json();
            
            if (data && data.code === 200 && data.data) {
                this.heroList = data.data;
                this.renderHeroList(this.heroList);
                this.showToast(`成功加载 ${this.heroList.length} 个英雄`);
            } else {
                // 如果API失败，使用备用数据
                this.loadFallbackHeroList();
            }
        } catch (error) {
            console.error('加载英雄数据失败:', error);
            this.showToast('加载失败，使用备用数据');
            this.loadFallbackHeroList();
        }
    }

    // 加载备用英雄数据
    loadFallbackHeroList() {
        this.heroList = [
            { name: "亚瑟", hero_type: "1", hero_type2: "1", cname: "亚瑟", iconUrl: "https://via.placeholder.com/60x60/299f92/ffffff?text=亚" },
            { name: "妲己", hero_type: "2", hero_type2: "2", cname: "妲己", iconUrl: "https://via.placeholder.com/60x60/299f92/ffffff?text=妲" },
            { name: "程咬金", hero_type: "3", hero_type2: "3", cname: "程咬金", iconUrl: "https://via.placeholder.com/60x60/299f92/ffffff?text=程" },
            { name: "兰陵王", hero_type: "4", hero_type2: "4", cname: "兰陵王", iconUrl: "https://via.placeholder.com/60x60/299f92/ffffff?text=兰" },
            { name: "后羿", hero_type: "5", hero_type2: "5", cname: "后羿", iconUrl: "https://via.placeholder.com/60x60/299f92/ffffff?text=后" },
            { name: "蔡文姬", hero_type: "6", hero_type2: "6", cname: "蔡文姬", iconUrl: "https://via.placeholder.com/60x60/299f92/ffffff?text=蔡" },
            { name: "李白", hero_type: "4", hero_type2: "4", cname: "李白", iconUrl: "https://via.placeholder.com/60x60/299f92/ffffff?text=李" },
            { name: "王昭君", hero_type: "2", hero_type2: "2", cname: "王昭君", iconUrl: "https://via.placeholder.com/60x60/299f92/ffffff?text=王" },
            { name: "张飞", hero_type: "3", hero_type2: "3", cname: "张飞", iconUrl: "https://via.placeholder.com/60x60/299f92/ffffff?text=张" },
            { name: "关羽", hero_type: "1", hero_type2: "1", cname: "关羽", iconUrl: "https://via.placeholder.com/60x60/299f92/ffffff?text=关" },
            { name: "孙尚香", hero_type: "5", hero_type2: "5", cname: "孙尚香", iconUrl: "https://via.placeholder.com/60x60/299f92/ffffff?text=孙" },
            { name: "大乔", hero_type: "6", hero_type2: "6", cname: "大乔", iconUrl: "https://via.placeholder.com/60x60/299f92/ffffff?text=大" }
        ];
        
        this.renderHeroList(this.heroList);
    }

    // 渲染英雄列表
    renderHeroList(heroes) {
        const container = document.getElementById('hero-list');
        if (!container) return;

        container.innerHTML = '';

        heroes.forEach(hero => {
            const heroCard = document.createElement('div');
            heroCard.className = 'hero-card';
            
            // 获取英雄类型和对应的颜色
            const heroType = this.getHeroTypeName(hero.hero_type);
            const typeColor = this.getHeroTypeColor(hero.hero_type);
            const typeTag = this.getHeroTypeTag(hero.hero_type);
            
            // 使用API返回的iconUrl，如果没有则使用默认图标
            const avatarHtml = hero.iconUrl ? 
                `<img src="${hero.iconUrl}" alt="${hero.cname}" class="hero-avatar-img">` :
                `<i class="fas fa-user"></i>`;
            
            heroCard.innerHTML = `
                <div class="hero-avatar" style="border: 2px solid ${typeColor};">
                    ${avatarHtml}
                    <div class="hero-type-tag" style="background-color: ${typeColor};">
                        ${typeTag}
                    </div>
                </div>
                <div class="hero-name">${hero.cname}</div>
            `;
            heroCard.addEventListener('click', () => {
                this.showHeroDetail(hero);
            });
            container.appendChild(heroCard);
        });
    }

    // 获取英雄类型名称
    getHeroTypeName(type) {
        const typeNames = {
            '1': '战士',
            '2': '法师', 
            '3': '坦克',
            '4': '刺客',
            '5': '射手',
            '6': '辅助'
        };
        return typeNames[type] || '';
    }

    // 获取英雄类型颜色
    getHeroTypeColor(type) {
        const typeColors = {
            '1': '#299f92', // 战士
            '2': '#764ba2', // 法师
            '3': '#78c4bc', // 坦克
            '4': '#667eea', // 刺客
            '5': '#f6ad55', // 射手
            '6': '#4facfe'  // 辅助
        };
        return typeColors[type] || '#999'; // 默认颜色
    }

    // 获取英雄类型标签
    getHeroTypeTag(type) {
        const typeTags = {
            '1': '战',
            '2': '法',
            '3': '坦',
            '4': '刺',
            '5': '射',
            '6': '辅'
        };
        return typeTags[type] || '';
    }

    // 搜索英雄
    searchHero(keyword) {
        if (!keyword.trim()) {
            // 搜索框为空时，激活"全部"标签
            this.filterHeroByType('all', false);
            return;
        }

        const filteredHeroes = this.heroList.filter(hero => 
            hero.cname.toLowerCase().includes(keyword.toLowerCase())
        );

        // 搜索有结果时，也激活"全部"标签
        this.filterHeroByType('all', false);
        this.renderHeroList(filteredHeroes);
        this.showToast(`找到 ${filteredHeroes.length} 个结果`);
    }

    // 按类型筛选英雄
    filterHeroByType(type, showToast = true) {
        // 更新标签状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 找到对应的标签并激活
        const targetTab = document.querySelector(`[data-type="${type}"]`);
        if (targetTab) {
            targetTab.classList.add('active');
        }

        let filteredHeroes;
        if (type === 'all') {
            filteredHeroes = this.heroList;
            this.renderHeroList(this.heroList);
        } else {
            // 将英文类型转换为数字类型
            const typeMapping = {
                'warrior': '1',
                'mage': '2',
                'tank': '3', 
                'assassin': '4',
                'marksman': '5',
                'support': '6'
            };
            const targetType = typeMapping[type];
            
            filteredHeroes = this.heroList.filter(hero => 
                hero.hero_type == targetType || hero.hero_type2 == targetType
            );
            this.renderHeroList(filteredHeroes);
        }

        if (showToast) {
            this.showToast(`已加载 ${filteredHeroes.length} 个英雄`);
        }
    }



    // 处理工具点击
    handleToolClick(toolName) {
        this.showToast(`点击了 ${toolName} 工具`);
        // 这里可以添加具体的工具实现
    }

    // 显示英雄详情
    showHeroDetail(hero) {
        const avatarHtml = hero.iconUrl ? 
            `<img src="${hero.iconUrl}" alt="${hero.cname}" style="width: 60px; height: 60px; border-radius: 4px; margin: 0 auto 15px;">` :
            `<div style="width: 60px; height: 60px; background: #299f92; border-radius: 4px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem;"><i class="fas fa-user"></i></div>`;
        
        this.showPopup(`英雄详情：${hero.cname}`, `
            <div style="text-align: center;">
                ${avatarHtml}
                <h3 style="margin-bottom: 15px;">${hero.cname}</h3>
                
                <div style="margin-top: 15px;">
                    <h4 style="margin-bottom: 12px; color: #299f92; font-size: 1rem;">战区查询</h4>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                        <button class="share-btn" onclick="app.shareHeroWithTransition('${hero.cname}', 'android', 'qq')">
                            <i class="fab fa-android"></i>
                            <span>安卓QQ</span>
                        </button>
                        <button class="share-btn" onclick="app.shareHeroWithTransition('${hero.cname}', 'android', 'wechat')">
                            <i class="fab fa-weixin"></i>
                            <span>安卓微信</span>
                        </button>
                        <button class="share-btn" onclick="app.shareHeroWithTransition('${hero.cname}', 'ios', 'qq')">
                            <i class="fab fa-apple"></i>
                            <span>苹果QQ</span>
                        </button>
                        <button class="share-btn" onclick="app.shareHeroWithTransition('${hero.cname}', 'ios', 'wechat')">
                            <i class="fab fa-apple"></i>
                            <span>苹果微信</span>
                        </button>
                    </div>
                    <p style="margin-top: 12px; font-size: 0.8rem; color: #999;">选择你要查询的大区</p>
                </div>
            </div>
        `);
    }



    // 显示弹窗
    showPopup(title, content) {
        const popup = document.getElementById('popup');
        const popupContent = document.getElementById('popup-content');
        
        if (popup && popupContent) {
            popupContent.innerHTML = content;
            
            popup.classList.add('show');
            
            // 禁用背景滚动
            this.disableBackgroundScroll();
        }
    }

    // 显示带过渡动画的弹窗
    showPopupWithTransition(title, content, heroName) {
        const popup = document.getElementById('popup');
        const popupContent = document.getElementById('popup-content');
        
        if (popup && popupContent) {
            // 创建过渡动画容器
            const transitionContainer = document.createElement('div');
            transitionContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 3000;
                animation: fadeIn 0.3s ease;
            `;
            
            // 查找英雄头像用于过渡动画
            const hero = this.heroList.find(h => h.cname === heroName);
            const avatarUrl = hero && hero.iconUrl ? hero.iconUrl : null;
            
            // 创建头像过渡元素
            const avatarTransition = document.createElement('div');
            avatarTransition.style.cssText = `
                width: 120px;
                height: 120px;
                border-radius: 50%;
                border: 4px solid #299f92;
                background: ${avatarUrl ? `url(${avatarUrl})` : '#299f92'};
                background-size: cover;
                background-position: center;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 3rem;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                animation: avatarTransition 0.6s ease-in-out;
            `;
            
            if (!avatarUrl) {
                avatarTransition.innerHTML = '<i class="fas fa-user"></i>';
            }
            
            transitionContainer.appendChild(avatarTransition);
            document.body.appendChild(transitionContainer);
            
            // 动画结束后显示结果弹窗
            setTimeout(() => {
                document.body.removeChild(transitionContainer);
                popupContent.innerHTML = content;
                popup.classList.add('show');
                
                // 禁用背景滚动
                this.disableBackgroundScroll();
            }, 600);
        }
    }

    // 关闭弹窗
    closePopup() {
        const popup = document.getElementById('popup');
        if (popup) {
            popup.classList.remove('show');
        }
        // 启用背景滚动
        this.enableBackgroundScroll();
    }

    // 禁用背景滚动
    disableBackgroundScroll() {
        // 保存当前滚动位置
        this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        
        // 禁用body滚动
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${this.scrollPosition}px`;
        document.body.style.width = '100%';
    }

    // 启用背景滚动
    enableBackgroundScroll() {
        // 恢复body样式
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        // 恢复到原来的滚动位置
        if (this.scrollPosition !== undefined) {
            window.scrollTo(0, this.scrollPosition);
        }
    }

    // 带过渡动画的查询战区数据
    async shareHeroWithTransition(heroName, platform, app) {
        // 首先创建头像过渡动画
        this.createAvatarTransition(heroName, platform, app);
    }

    // 创建头像过渡动画
    createAvatarTransition(heroName, platform, app) {
        // 禁用背景滚动，保存当前滚动位置
        this.disableBackgroundScroll();
        
        // 查找英雄信息
        const hero = this.heroList.find(h => h.cname === heroName);
        const avatarUrl = hero && hero.iconUrl ? hero.iconUrl : null;
        
        // 创建过渡容器
        const transitionContainer = document.createElement('div');
        transitionContainer.id = 'avatar-transition';
        transitionContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
            animation: fadeIn 0.3s ease;
        `;
        
        // 创建头像元素
        const avatarElement = document.createElement('div');
        avatarElement.style.cssText = `
            width: 120px;
            height: 120px;
            border-radius: 50%;
            border: 4px solid #299f92;
            background: ${avatarUrl ? `url(${avatarUrl})` : '#299f92'};
            background-size: cover;
            background-position: center;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 3rem;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            animation: avatarExpand 0.8s ease-in-out;
        `;
        
        if (!avatarUrl) {
            avatarElement.innerHTML = '<i class="fas fa-user"></i>';
        }
        
        // 添加加载文字
        const loadingText = document.createElement('div');
        loadingText.style.cssText = `
            position: absolute;
            bottom: 30%;
            color: white;
            font-size: 1.2rem;
            font-weight: bold;
            text-align: center;
            animation: pulse 1.5s ease-in-out infinite;
        `;
        loadingText.textContent = `正在查询${heroName}的战区数据...`;
        
        transitionContainer.appendChild(avatarElement);
        transitionContainer.appendChild(loadingText);
        document.body.appendChild(transitionContainer);
        
        // 动画完成后执行查询
        setTimeout(() => {
            this.executeHeroQuery(heroName, platform, app);
        }, 800);
    }

    // 执行英雄查询
    async executeHeroQuery(heroName, platform, app) {
        const platformName = platform === 'android' ? '安卓' : '苹果';
        const appName = app === 'qq' ? 'QQ' : '微信';
        
        // 构建type参数
        const typeMap = {
            'android-qq': 'aqq',
            'android-wechat': 'awx', 
            'ios-qq': 'iqq',
            'ios-wechat': 'iwx'
        };
        const type = typeMap[`${platform}-${app}`];
        
        try {
            // 调用API获取数据
            const response = await fetch(`https://api.xxoo.team/hero/getHeroInfo.php?type=${type}&hero=${encodeURIComponent(heroName)}`);
            const data = await response.json();
            
            console.log('API响应:', data);
            console.log('查询参数:', { type, hero: heroName });
            
            if (data && data.code === 200 && data.data) {
                // 获取当前时间
                const now = new Date();
                const timestamp = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
                
                this.showToast('查询成功');
                this.showQueryResultsWithTransition(heroName, platformName, appName, data.data, timestamp);
            } else {
                console.error('API错误:', data);
                this.showToast(`查询失败: ${data.msg || '未知错误'}`);
                
                // 使用备用数据
                const fallbackData = {
                    province: '澳门',
                    provincePower: '6688',
                    city: '通化市',
                    cityPower: '4338',
                    area: '偏关县',
                    areaPower: '2263',
                    updatetime: timestamp
                };
                
                this.showQueryResultsWithTransition(heroName, platformName, appName, fallbackData, timestamp);
            }
        } catch (error) {
            console.error('查询数据失败:', error);
            this.showToast('网络错误，显示示例数据');
            
            // 网络错误时使用备用数据
            const now = new Date();
            const timestamp = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
            
            const fallbackData = {
                province: '澳门',
                provincePower: '6688',
                city: '通化市',
                cityPower: '4338',
                area: '偏关县',
                areaPower: '2263',
                updatetime: timestamp
            };
            
            this.showQueryResultsWithTransition(heroName, platformName, appName, fallbackData, timestamp);
        }
    }

    // 获取切换按钮HTML
    getSwitchButtons(heroName, currentPlatform, currentApp) {
        const allPlatforms = [
            { platform: 'android', app: 'qq', name: '安卓QQ' },
            { platform: 'android', app: 'wechat', name: '安卓微信' },
            { platform: 'ios', app: 'qq', name: '苹果QQ' },
            { platform: 'ios', app: 'wechat', name: '苹果微信' }
        ];
        
        return allPlatforms.map(p => {
            const isCurrent = p.platform === currentPlatform && p.app === currentApp;
            return `
                <button onclick="app.shareHeroWithTransition('${heroName}', '${p.platform}', '${p.app}')" style="
                    background: ${isCurrent ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(120, 196, 188, 0.3)'};
                    color: ${isCurrent ? 'white' : '#333'};
                    border: none;
                    padding: 8px 12px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: ${isCurrent ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    <span>${p.name}</span>
                </button>
            `;
        }).join('');
    }

    // 带过渡动画的查询结果展示
    showQueryResultsWithTransition(heroName, platformName, appName, queryData, timestamp) {
        // 启用背景滚动，恢复滚动位置
        this.enableBackgroundScroll();
        
        // 移除过渡动画
        const transitionContainer = document.getElementById('avatar-transition');
        if (transitionContainer) {
            transitionContainer.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(transitionContainer)) {
                    document.body.removeChild(transitionContainer);
                }
            }, 300);
        }
        
        // 解析API返回的数据结构
        const results = [
            { reward: '金牌', region: queryData.province || '暂无数据', score: queryData.provincePower || '0' },
            { reward: '银牌', region: queryData.city || '暂无数据', score: queryData.cityPower || '0' },
            { reward: '铜牌', region: queryData.area || '暂无数据', score: queryData.areaPower || '0' }
        ];
        
        // 使用API返回的更新时间，如果没有则使用当前时间
        const updateTime = queryData.updatetime || timestamp;
        
        // 查找英雄信息以获取头像
        const hero = this.heroList.find(h => h.cname === heroName);
        const avatarHtml = hero && hero.iconUrl ? 
            `<img src="${hero.iconUrl}" alt="${heroName}" style="width: 80px; height: 80px; border-radius: 12px; margin-right: 15px;">` :
            `<div style="width: 80px; height: 80px; background: #299f92; border-radius: 12px; margin-right: 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;"><i class="fas fa-user"></i></div>`;
        
        // 获取当前平台信息用于切换按钮
        const platform = platformName === '安卓' ? 'android' : 'ios';
        const app = appName === 'QQ' ? 'qq' : 'wechat';
        
        const resultsHtml = `
            <div style="text-align: center; max-width: 400px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #78c4bc 100%); color: white; padding: 15px; border-radius: 12px 12px 0 0; margin: -20px -20px 0 -20px; width: calc(100% + 40px);">
                    <h3 style="margin: 0; font-size: 1.2rem;">${heroName}最低战区查询结果</h3>
                </div>
                
                <div style="margin-top: 15px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; margin-bottom: 15px;">
                        ${this.getSwitchButtons(heroName, platform, app)}
                    </div>
                    <div style="background: linear-gradient(135deg, #78c4bc 0%, #299f92 100%); border-radius: 12px; padding: 15px; margin-bottom: 15px; display: flex; align-items: center; justify-content: flex-start;">
                        ${avatarHtml}
                        <div style="text-align: left; color: white;">
                            <div style="font-size: 1rem; margin-bottom: 5px;">当前英雄: ${heroName}</div>
                            <div style="font-size: 0.9rem; margin-bottom: 5px;">最低国标: ${queryData.guobiao || '暂无数据'}</div>
                            <div style="font-size: 0.9rem;">当前系统: ${platformName}-${appName}区</div>
                        </div>
                    </div>
                    
                    <div style="background: #e8e4ff; padding: 10px; border-radius: 8px; margin-bottom: 10px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; font-weight: bold; color: #333;">
                            <div>奖励</div>
                            <div>区域</div>
                            <div>分数</div>
                        </div>
                    </div>
                    
                    ${results.map((result, index) => `
                        <div style="background: ${index % 2 === 0 ? '#e8f5e8' : '#fff3e0'}; padding: 10px; border-radius: 8px; margin-bottom: 8px;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; color: #333;">
                                <div>${result.reward}</div>
                                <div onclick="navigator.clipboard.writeText('${result.region}').then(() => app.showToast('已复制: ${result.region}')).catch(() => app.showToast('复制失败'))" style="cursor: pointer; user-select: text; padding: 2px 4px; border-radius: 4px; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='rgba(0,0,0,0.1)'" onmouseout="this.style.backgroundColor='transparent'">${result.region}</div>
                                <div>${result.score}</div>
                            </div>
                        </div>
                    `).join('')}
                    
                    <div style="background: #f0f8ff; border-radius: 8px; padding: 8px; margin-top: 10px; margin-bottom: 8px;">
                        <div style="text-align: center; color: #666; font-size: 0.8rem;">
                            💡 点击地区可以复制地区
                        </div>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #78c4bc 0%, #299f92 100%); border-radius: 12px; padding: 10px; margin-top: 10px;">
                        <div style="text-align: center; color: white; font-size: 0.9rem;">
                            数据更新时间: ${updateTime}
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px;">
                        <button class="close-result-btn" onclick="app.closePopup()" style="
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            border: none;
                            padding: 12px 30px;
                            border-radius: 25px;
                            font-size: 1rem;
                            font-weight: bold;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            <i class="fas fa-times" style="margin-right: 8px;"></i>
                            关闭
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // 延迟显示结果，让过渡动画完成
        setTimeout(() => {
            this.showPopup(`${heroName}最低战区查询结果`, resultsHtml);
        }, 300);
    }

    // 查询战区数据（保留原方法作为备用）
    async shareHero(heroName, platform, app) {
        const platformName = platform === 'android' ? '安卓' : '苹果';
        const appName = app === 'qq' ? 'QQ' : '微信';
        
        // 构建type参数
        const typeMap = {
            'android-qq': 'aqq',
            'android-wechat': 'awx', 
            'ios-qq': 'iqq',
            'ios-wechat': 'iwx'
        };
        const type = typeMap[`${platform}-${app}`];
        
        try {
            const loadingToast = this.showToast('正在查询数据...');
            
            // 调用API获取数据，使用API中的英雄名称
            const response = await fetch(`https://api.xxoo.team/hero/getHeroInfo.php?type=${type}&hero=${encodeURIComponent(heroName)}`);
            const data = await response.json();
            
            console.log('API响应:', data); // 调试日志
            console.log('查询参数:', { type, hero: heroName }); // 调试参数
            
            if (data && data.code === 200 && data.data) {
                // 获取当前时间
                const now = new Date();
                const timestamp = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
                
                // 立即移除加载提示
                if (loadingToast) {
                    document.body.removeChild(loadingToast);
                }
                
                this.showToast('查询成功');
                this.showQueryResultsWithTransition(heroName, platformName, appName, data.data, timestamp);
            } else {
                // API返回错误，显示错误信息
                console.error('API错误:', data);
                this.showToast(`查询失败: ${data.msg || '未知错误'}`);
                
                // 使用备用数据
                const fallbackData = {
                    province: '澳门',
                    provincePower: '6688',
                    city: '通化市',
                    cityPower: '4338',
                    area: '偏关县',
                    areaPower: '2263',
                    updatetime: timestamp
                };
                
                this.showQueryResultsWithTransition(heroName, platformName, appName, fallbackData, timestamp);
            }
        } catch (error) {
            console.error('查询数据失败:', error);
            this.showToast('网络错误，显示示例数据');
            
            // 网络错误时使用备用数据
            const fallbackData = {
                province: '澳门',
                provincePower: '6688',
                city: '通化市',
                cityPower: '4338',
                area: '偏关县',
                areaPower: '2263',
                updatetime: timestamp
            };
            
            this.showQueryResultsWithTransition(heroName, platformName, appName, fallbackData, timestamp);
        }
    }



    // 显示提示信息
    showToast(message) {
        // 创建临时提示元素
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #299f92;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (document.body.contains(toast)) {
                        document.body.removeChild(toast);
                    }
                }, 300);
            }
        }, 3000);
        
        return toast; // 返回toast元素以便后续移除
    }


}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes avatarExpand {
        0% { 
            transform: scale(1); 
            opacity: 0.3;
            filter: brightness(0.5) contrast(0.8);
        }
        25% { 
            transform: scale(1); 
            opacity: 0.6;
            filter: brightness(1.2) contrast(1.1);
        }
        50% { 
            transform: scale(1); 
            opacity: 0.8;
            filter: brightness(1.5) contrast(1.3);
        }
        75% { 
            transform: scale(1); 
            opacity: 0.9;
            filter: brightness(1.8) contrast(1.5);
        }
        100% { 
            transform: scale(1); 
            opacity: 1;
            filter: brightness(1) contrast(1);
        }
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
    
    .hero-avatar-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;
document.head.appendChild(style);

// 页面加载完成后初始化应用
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new QianYueApp();
});
