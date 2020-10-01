import './index.scss';

const API_KEY = 'e8b3c5ed-fcae-444c-b93e-e45436c12c38';
const url = `https://content.guardianapis.com/search?api-key=${API_KEY}`;

const list = document.getElementById('list');
const loader = document.getElementById('loader');
const refreshBtn = document.getElementById('refresh');

async function getNews() {
    const result = await fetch(url)
        .then((res) => res.json(), (e) => {
            throw new Error(`Сетевая ошибка: ${e.message}`);
        })
        .then(({ response }) => response.results);
    return result;
}

function insertNewsElement(text) {
    const element = document.createElement('li');
    element.insertAdjacentText('beforeend', text);
    list.insertAdjacentElement('beforeend', element);
}

async function renderNews() {
    list.innerHTML = '';
    loader.classList.toggle('hidden-block');
    try {
        await getNews(url)
            .then((news) => {
                news.forEach(({ webTitle }) => {
                    insertNewsElement(webTitle);
                });
            });
    } catch (e) {
        const warningElement = document.createElement('li');
        warningElement.insertAdjacentText('beforeend', e.message);
        warningElement.classList.add('text-danger', 'error');
        list.insertAdjacentElement('beforeend', warningElement);
    }
    loader.classList.toggle('hidden-block');
}

refreshBtn.addEventListener('click', renderNews);
renderNews();
