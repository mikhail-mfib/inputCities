'use strict';

let lang,
    firstCountry = {
        RU: 'Россия',
        EN: 'United Kingdom',
        DE: 'Deutschland'
    };

//находим элементы списков, кнопки
const   langContainer = document.querySelector('.lang-container'),
        loader = document.querySelector('.loader'),
        inputCities = document.querySelector('.input-cities'),
        dropdownLists = inputCities.querySelector('.dropdown-lists'),
        input = inputCities.querySelector('#select-cities'),
        label = inputCities.querySelector('.label'),
        listDefault = dropdownLists.querySelector('.dropdown-lists__list--default'),
        listSelect = dropdownLists.querySelector('.dropdown-lists__list--select'),
        listDefaultCol = listDefault.querySelector('.dropdown-lists__col'),
        listSelectCol = listSelect.querySelector('.dropdown-lists__col'),
        listAutocomplete = dropdownLists.querySelector('.dropdown-lists__list--autocomplete'),
        listAutocompleteCol = listAutocomplete.querySelector('.dropdown-lists__col'),
        button = inputCities.querySelector('.button'),
        closeButton = inputCities.querySelector('.close-button'),
        arrowRightSrc = './icons/right-arrow.svg',
        arrowLeftSrc = './icons/left-arrow.svg',
        emptyLiveSearch = {
        "name": "Ничего не найдено",
        "count": ""
        };  

//основной скрипт, который будет запущен после загрузки данных
const execJs = (data) => {
    
    //настройка кнопки
    button.style = 'pointer-events: none';
    button.target = '_blank';
    
    //для красоты
    setTimeout(() => {
        inputCities.style.display = 'block';
        loader.remove();
    }, 1500);
    
    //функция создания блока с одним городом
    const getCityBlock = (name, count, container) => {
        let listLine = document.createElement('div'),
            listCity = document.createElement('div'),
            listCount = document.createElement('div');
            
        listLine.classList.add('dropdown-lists__line');
        listCity.classList.add('dropdown-lists__city');
        listCount.classList.add('dropdown-lists__count');

        listCity.innerHTML = name;
        listCount.textContent = count;

        listLine.appendChild(listCity);
        listLine.appendChild(listCount);
        container.appendChild(listLine);
    };

    //функция создания одного блока с городами/страной
    const getCountryBlock = (countryObj, container, numCities) => {
        if(!numCities) {
            numCities = countryObj.cities.length;
        }

        const   countryBlock = document.createElement('div'),
                totalLine = document.createElement('div'),
                totalLineCountry = document.createElement('div'),
                totalLineArrow = document.createElement('img'),
                totalLineCount = document.createElement('div');

        countryBlock.classList.add('dropdown-lists__countryBlock');
        totalLine.classList.add('dropdown-lists__total-line');
        totalLineCountry.classList.add('dropdown-lists__country');
        totalLineArrow.classList.add('dropdown-lists__count');
        totalLineCount.classList.add('dropdown-lists__count');

        totalLineCountry.textContent = countryObj.country;

        if(container == listDefaultCol) {
            totalLineArrow.src = arrowRightSrc;
        } else {
            totalLineArrow.src = arrowLeftSrc;
        }
        
        totalLineCount.textContent = countryObj.count;

        countryBlock.appendChild(totalLine);

        for (let i = 0; i < numCities; i++) {
            getCityBlock(countryObj.cities[i].name, countryObj.cities[i].count, countryBlock);
        }
        
        totalLine.appendChild(totalLineCountry);
        totalLine.appendChild(totalLineArrow);
        totalLine.appendChild(totalLineCount);

        if(firstCountry[getCookie('lang')] === countryObj.country) {
            container.insertAdjacentElement('afterbegin', countryBlock);
        } else {
            container.appendChild(countryBlock);
        }
    };

    data.forEach((itemCountry) => {
        getCountryBlock(itemCountry, listDefaultCol, 3);
    });

    //добавление элементов в list--select 
    const addListSelect = (value) => {
        const selectedCountryObj =  data.filter((itemCountry) => {
            return itemCountry.country === value;
        });

        getCountryBlock(selectedCountryObj[0], listSelectCol);
    };

    //живой поиск для list--autocomplete, возвращает массив объектов с подходящими городами
    const liveSearch = (text) => {
        //экранирование спецсимволов при вводе
        let patternText = text.replace(/[^а-яa-z0-9-]/i, (str) => {
            return `\${str}`;
        }),
            pattern = new RegExp('^' + patternText, 'i'),
            patternArray = [];
    
        data.forEach((itemCountry) => {
            for(let i = 0; i < itemCountry.cities.length; i++) {
                if(pattern.test(itemCountry.cities[i].name)) {
                    let tempObj = Object.create(itemCountry.cities[i]);
                    patternArray.push(tempObj);
                }
            }
        });
        
        if(patternArray.length === 0) {
            patternArray.push(emptyLiveSearch);
        } else {
            patternArray.forEach((item) => {
                item.name = item.name.replace(pattern, replacerStrong);
            });
        }

        return patternArray;
    };
    //Выделение найденого для живого поиска
    const replacerStrong = (str) => {
        return `<strong>${str}</strong>`;
    };
    
    //добавление элементов в list--autocomplete
    const addListautocomplete = (inputText) => {
        removeChildren(listAutocompleteCol);

        const resultInput = liveSearch(inputText);

        resultInput.forEach((item) => {
            getCityBlock(item.name, item.count, listAutocompleteCol);
        });
    };

    //поиск ссылки города
    const getLink = (city) => {
        let link;

        data.forEach((itemCountry) => {
            for(let i = 0; i < itemCountry.cities.length; i++) {
                if(city === itemCountry.cities[i].name) {
                    link = itemCountry.cities[i].link;
                    break;
                }
            }
        });
        
        link = link ? link : link = '#';
        
        return link;
    };

    //удаление всех дочерних элементов узла
    const removeChildren = (elem) => {
        while (elem.lastChild) {
            elem.removeChild(elem.lastChild);
        }
        };

    document.addEventListener('click', (evt) => {
        //проверка клика мимо селекторов и инпута
        if(( !evt.target.closest('.dropdown') && 
                !evt.target.matches('#select-cities, .label, .input-cities, .button') ) || 
                evt.target.matches('.close-button')) 
        {
            if(input.value) {
                label.textContent = '';
            } else {label.textContent = 'Страна или город';}

            listDefault.classList.remove('slide-out');
            listSelect.classList.remove('slide-in');
            listAutocomplete.style.display = 'none';

            if(evt.target.matches('.close-button')) {
                label.textContent = 'Страна или город';
                input.value = '';
                closeButton.style.display = 'none';
                button.style = 'pointer-events: none';
            }

            removeChildren(listSelectCol);
            removeChildren(listAutocompleteCol);
        }

        //отображение list--default
        if( evt.target.matches('#select-cities, .label, .input-cities') ||
            ( evt.target.closest('.dropdown-lists__total-line') && 
                evt.target.closest('.dropdown-lists__list--select') )) 
        {
            listDefault.classList.add('slide-out');
            listSelect.classList.remove('slide-in'); 
            listAutocomplete.style.display = 'none';

            removeChildren(listSelectCol);
            removeChildren(listAutocompleteCol);
        }

        //отображение list--select
        if( evt.target.closest('.dropdown-lists__total-line') && 
            evt.target.closest('.dropdown-lists__list--default')) 
        {
            let target = evt.target.closest('.dropdown-lists__total-line');
            
            addListSelect(target.firstChild.textContent);

            listDefault.classList.remove('slide-out');
            listSelect.classList.add('slide-in');
        }
        
        //подстановка выбранного значения в инпут
        if( evt.target.closest('.dropdown-lists__line') || 
            evt.target.closest('.dropdown-lists__total-line')) 
        {
            if(evt.target.closest('.dropdown-lists__line')) {
                listDefault.classList.remove('slide-out');
                listSelect.classList.remove('slide-in');
                removeChildren(listSelectCol);
            }

            let target = evt.target.closest('.dropdown-lists__total-line') ? evt.target.closest('.dropdown-lists__total-line') : evt.target.closest('.dropdown-lists__line');

            closeButton.style.display = 'block';
            input.focus();
            input.value = target.firstChild.textContent;
            button.href = getLink(target.firstChild.textContent);
            button.style = (button.href.slice(-1) !== '#') ? 'pointer-events: auto' : 'pointer-events: none';

        }
        
    });

    //отображение результатов живого поиска
    input.addEventListener('keyup', (evt) => {
        button.style = 'pointer-events: none';
        
        if(evt.target.value) {
            listDefault.classList.remove('slide-out');
            listSelect.classList.remove('slide-in');
            closeButton.style.display = 'block';
            listAutocomplete.style.display = 'block';
            button.href = '#';

            input.focus();
            removeChildren(listSelectCol);
            addListautocomplete(evt.target.value);
            
        } else {
            listDefault.classList.add('slide-out');
            closeButton.style.display = 'none';
            listSelect.classList.remove('slide-in');
            listAutocomplete.style.display = 'none';

            removeChildren(listSelectCol);
            removeChildren(listAutocompleteCol);
        }
    });
};

//запрос к файлу
const getData = (lang) => {
    return fetch('db_cities.json')
            .then((response) => {
                if(response.status !== 200) {
                    throw new Error('network status not 200');
                }
                return response.json();
            })
            .then((response) => {
                const serialObj = JSON.stringify(response[lang]);

                localStorage.setItem('data', serialObj);

                execJs(response[lang]);
            })
            .catch(error => console.log(error));
};

//запись куки
const setCookie = (name, value, days) => {
    let expires;
    if(days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    else {expires = "";}
    
    document.cookie = name + "=" + value + expires + "; path=/";
};

//чтение куки
const getCookie = (name) => {
    const matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
    return matches ? decodeURIComponent(matches[1]) : undefined;
};

window.addEventListener('DOMContentLoaded', () => {
    if(getCookie('lang') && localStorage.getItem('data')) {
        loader.style.display = 'inline-block';
        langContainer.style.display = 'none';

        execJs(JSON.parse(localStorage.getItem('data')));
    } else {
        langContainer.style.display = 'block';

        langContainer.addEventListener('click', (evt) => {
            if(evt.target.matches('.lang>div')) {
                lang = evt.target.textContent;

                setCookie('lang', lang, 24*365*10);

                loader.style.display = 'inline-block';
                langContainer.style.display = 'none';

                getData(lang);
            }
        });
    }
});
