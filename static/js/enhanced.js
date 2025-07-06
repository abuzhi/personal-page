// Enhanced Personal Navigation Page JavaScript

// Time and Date functionality
class TimeManager {
    constructor() {
        this.init();
    }

    init() {
        this.updateTime();
        this.updateDate();
        setInterval(() => this.updateTime(), 1000);
        setInterval(() => this.updateDate(), 60000); // Update date every minute
    }

    updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        document.getElementById('hours').textContent = hours;
        document.getElementById('minutes').textContent = minutes;
        document.getElementById('seconds').textContent = seconds;
    }

    updateDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const date = now.getDate();
        const dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const dayName = dayNames[now.getDay()];

        document.getElementById('current-date-display').textContent = 
            `${year}年${month}月${date}日`;
        document.getElementById('current-day').textContent = dayName;
    }
}

// Calendar functionality
class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.today = new Date();
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('prev-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.render();
        });

        document.getElementById('next-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.render();
        });
    }

    render() {
        this.renderHeader();
        this.renderDays();
    }

    renderHeader() {
        const monthNames = [
            '1月', '2月', '3月', '4月', '5月', '6月',
            '7月', '8月', '9月', '10月', '11月', '12月'
        ];
        
        const monthYear = `${this.currentDate.getFullYear()}年${monthNames[this.currentDate.getMonth()]}`;
        document.getElementById('calendar-month-year').textContent = monthYear;
    }

    renderDays() {
        const daysContainer = document.getElementById('calendar-days');
        daysContainer.innerHTML = '';

        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = date.getDate();

            // Add classes for styling
            if (date.getMonth() !== this.currentDate.getMonth()) {
                dayElement.classList.add('other-month');
            }

            if (this.isSameDay(date, this.today)) {
                dayElement.classList.add('today');
            }

            dayElement.addEventListener('click', () => {
                // Remove previous selection
                document.querySelectorAll('.calendar-day.selected').forEach(el => {
                    el.classList.remove('selected');
                });
                dayElement.classList.add('selected');
            });

            daysContainer.appendChild(dayElement);
        }
    }

    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }
}

// Weather functionality
class WeatherManager {
    constructor() {
        this.init();
    }

    init() {
        this.updateWeather();
        // Update weather every 30 minutes
        setInterval(() => this.updateWeather(), 30 * 60 * 1000);
    }

    async updateWeather() {
        try {
            // For demo purposes, we'll use mock data
            // In a real implementation, you would fetch from a weather API
            const mockWeatherData = {
                temperature: Math.floor(Math.random() * 30) + 10,
                description: this.getRandomWeather(),
                humidity: Math.floor(Math.random() * 40) + 40,
                windSpeed: Math.floor(Math.random() * 20) + 5
            };

            this.displayWeather(mockWeatherData);
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    }

    getRandomWeather() {
        const conditions = ['晴天', '多云', '阴天', '小雨', '雨天'];
        return conditions[Math.floor(Math.random() * conditions.length)];
    }

    displayWeather(data) {
        document.querySelector('.temperature').textContent = `${data.temperature}°C`;
        document.querySelector('.weather-desc').textContent = data.description;
        
        const weatherItems = document.querySelectorAll('.weather-item span:last-child');
        weatherItems[0].textContent = `湿度: ${data.humidity}%`;
        weatherItems[1].textContent = `风速: ${data.windSpeed}km/h`;

        // Update weather icon based on description
        const weatherIcon = document.querySelector('.weather-icon');
        const iconMap = {
            '晴天': 'wi:day-sunny',
            '多云': 'wi:day-cloudy',
            '阴天': 'wi:cloudy',
            '小雨': 'wi:rain',
            '雨天': 'wi:rain'
        };
        
        weatherIcon.setAttribute('data-icon', iconMap[data.description] || 'wi:day-sunny');
    }
}

// Notes functionality
class NotesManager {
    constructor() {
        this.notes = this.loadNotes();
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('add-note').addEventListener('click', () => {
            this.addNote();
        });

        // Add note on Enter key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.addNote();
            }
        });
    }

    addNote() {
        const noteText = prompt('请输入笔记内容:');
        if (noteText && noteText.trim()) {
            const note = {
                id: Date.now(),
                text: noteText.trim(),
                timestamp: new Date().toLocaleString('zh-CN')
            };
            this.notes.unshift(note);
            this.saveNotes();
            this.render();
        }
    }

    deleteNote(id) {
        this.notes = this.notes.filter(note => note.id !== id);
        this.saveNotes();
        this.render();
    }

    render() {
        const notesContainer = document.getElementById('notes-list');
        notesContainer.innerHTML = '';

        if (this.notes.length === 0) {
            notesContainer.innerHTML = '<div class="no-notes">暂无笔记</div>';
            return;
        }

        this.notes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note-item';
            noteElement.innerHTML = `
                <div class="note-text">${this.escapeHtml(note.text)}</div>
                <div class="note-timestamp">${note.timestamp}</div>
                <button class="delete-note" onclick="notesManager.deleteNote(${note.id})">
                    <span class="iconify" data-icon="akar-icons:trash"></span>
                </button>
            `;
            notesContainer.appendChild(noteElement);
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    loadNotes() {
        try {
            const saved = localStorage.getItem('personal-nav-notes');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading notes:', error);
            return [];
        }
    }

    saveNotes() {
        try {
            localStorage.setItem('personal-nav-notes', JSON.stringify(this.notes));
        } catch (error) {
            console.error('Error saving notes:', error);
        }
    }
}

// Enhanced search functionality
class SearchManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSearchHistory();
    }

    bindEvents() {
        const searchInput = document.getElementById('search-text');
        const searchForm = document.getElementById('super-search-fm');

        searchInput.addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });

        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.performSearch(searchInput.value);
        });

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && !e.ctrlKey && !e.altKey && !e.metaKey) {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }

    handleSearchInput(query) {
        // Add search suggestions or live search functionality here
        if (query.length > 2) {
            // Implement search suggestions
            this.showSearchSuggestions(query);
        }
    }

    showSearchSuggestions(query) {
        // Implement search suggestions dropdown
        console.log('Search suggestions for:', query);
    }

    performSearch(query) {
        if (query.trim()) {
            this.saveSearchHistory(query);
            // The existing search functionality will handle the actual search
        }
    }

    saveSearchHistory(query) {
        try {
            let history = JSON.parse(localStorage.getItem('search-history') || '[]');
            history = history.filter(item => item !== query);
            history.unshift(query);
            history = history.slice(0, 10); // Keep only last 10 searches
            localStorage.setItem('search-history', JSON.stringify(history));
        } catch (error) {
            console.error('Error saving search history:', error);
        }
    }

    loadSearchHistory() {
        try {
            const history = JSON.parse(localStorage.getItem('search-history') || '[]');
            // Display search history if needed
            return history;
        } catch (error) {
            console.error('Error loading search history:', error);
            return [];
        }
    }
}

// Animation and UI enhancements
class UIEnhancer {
    constructor() {
        this.init();
    }

    init() {
        this.addScrollAnimations();
        this.addHoverEffects();
        this.addKeyboardShortcuts();
    }

    addScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        });

        document.querySelectorAll('.jj-list, .time-widget, .calendar-widget, .weather-widget, .notes-widget').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            observer.observe(el);
        });
    }

    addHoverEffects() {
        // Add particle effects or other hover enhancements
        document.querySelectorAll('.jj-list-con li').forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateY(-2px) scale(1.02)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + K to focus search
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                document.getElementById('search-text').focus();
            }
            
            // Escape to clear search
            if (e.key === 'Escape') {
                const searchInput = document.getElementById('search-text');
                if (document.activeElement === searchInput) {
                    searchInput.blur();
                    searchInput.value = '';
                }
            }
        });
    }
}

// Initialize all components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all managers
    window.timeManager = new TimeManager();
    window.calendar = new Calendar();
    window.weatherManager = new WeatherManager();
    window.notesManager = new NotesManager();
    window.searchManager = new SearchManager();
    window.uiEnhancer = new UIEnhancer();

    // Add loading animation
    document.body.classList.add('loaded');
    
    // Show welcome message
    setTimeout(() => {
        console.log('🎉 Enhanced Personal Navigation Page loaded successfully!');
        console.log('💡 Keyboard shortcuts:');
        console.log('  - "/" to focus search');
        console.log('  - "Ctrl+K" to focus search');
        console.log('  - "Ctrl+Enter" to add note');
        console.log('  - "Escape" to clear search');
    }, 1000);
});

// Add some utility functions
window.utils = {
    formatDate: (date) => {
        return new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    },
    
    formatTime: (date) => {
        return new Intl.DateTimeFormat('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date);
    },
    
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TimeManager,
        Calendar,
        WeatherManager,
        NotesManager,
        SearchManager,
        UIEnhancer
    };
} 