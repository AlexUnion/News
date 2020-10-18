/*eslint-disable*/
import './index.scss';
import axios from 'axios';

import $ from 'jquery';

const API_KEY = 'e8b3c5ed-fcae-444c-b93e-e45436c12c38';
const ARROW_URL = 'https://i.ibb.co/7zNk9Tv/forwardarrow-haciaadelante-4836.png';
const SLIDE_TIME = 500;

const globalParams = {
    currentPage: null,
    maxPages: null,
}

const list = document.getElementById('list');
const loader = document.getElementById('loader');
const refreshBtn = document.getElementById('refresh');

const currentPageDisplay = document.getElementById('current-page');
const maxPagesDisplay = document.getElementById('pages');
const previousPageBtn = document.getElementById('previous-page');
const nextPageBtn = document.getElementById('next-page');

const api = axios.create({
    baseURL: 'https://content.guardianapis.com',
});

api.interceptors.request.use((config) => {
    const { url } = config;
    const apiKeyQuery = url.includes('?') ? `&api-key=${API_KEY}` : `?api-key=${API_KEY}`;

    return {
        ...config,
        url: `${url}${apiKeyQuery}`,
    };
})

api.interceptors.response.use(({ data }) => {
    return data.response;
})

function insertNewsElement(params) {
    const { webUrl, webTitle, description, id } = params;
    const element = document.createElement('li');
    const header = document.createElement('div');
    const descriptionBlock = document.createElement('div');

    const link = document.createElement('a');
    link.setAttribute('href', webUrl);
    link.insertAdjacentText('beforeend', 'Read more');

    const title = document.createElement('h2');
    const img = document.createElement('img');
    img.setAttribute('src', ARROW_URL);
    img.setAttribute('alt', 'arrow');
    title.insertAdjacentText('beforeend', webTitle);

    header.classList.add('li-header');
    header.insertAdjacentElement('beforeend', title);
    header.insertAdjacentElement('beforeend', img);

    descriptionBlock.classList.add('description', 'hidden-block');
    descriptionBlock.setAttribute('id', id);
    descriptionBlock.insertAdjacentText('beforeend', description);
    descriptionBlock.insertAdjacentElement('beforeend', link);

    element.insertAdjacentElement('beforeend', header);
    element.insertAdjacentElement('beforeend', descriptionBlock);

    list.insertAdjacentElement('beforeend', element);

    element.addEventListener('click', () => {
        $('.description').each((idx, item) => {
            const itemID = item.getAttribute('id');
            if (itemID !== id) {
                $(item).slideUp(SLIDE_TIME);
            } else {
                $(descriptionBlock).slideDown(SLIDE_TIME);
            }
        });
    })
}

async function getPosts(method) {

    if (method === 'next-page') {
        const page = globalParams.currentPage + 1;
        if (page <= globalParams.maxPages) {

            const response = await api.get(`/search?page=${page}`);
            console.log(response);
            return response;
        }

    } else if (method === 'previous-page') {

        const page = globalParams.currentPage - 1;
        if (page > 1) {
            const response = await api.get(`/search?page=${page}`);
            return response;
        }
    }

    const response = await api.get('/search');
    return response;
}

async function renderNews(method) {
    list.innerHTML = '';
    $(loader).toggleClass('hidden-block')
    try {
        const { results, currentPage, pages } = await getPosts(method);
        globalParams.currentPage = currentPage;
        globalParams.maxPages = pages;

        currentPageDisplay.innerText = currentPage;
        maxPagesDisplay.innerText = pages;

        results.forEach((item) => {

            const { webTitle, id, webUrl } = item;

            api.get(`/${id}?show-blocks=body`)
                .then((data) => {
                    const body = data.content.blocks.body[0];
                    const text = body.bodyTextSummary;
                    const description = text.substring(0, 300) + '...';
                    return description;
                })
                .then((description) => {
                    const params = {
                        webUrl,
                        webTitle,
                        description,
                        id,
                    }
                    insertNewsElement(params);
                });
        })
    } catch (e) {
        const warningElement = document.createElement('li');
        warningElement.insertAdjacentText('beforeend', e.message);
        warningElement.classList.add('text-danger', 'error');
        list.insertAdjacentElement('beforeend', warningElement);
    }
    loader.classList.toggle('hidden-block');
}

function onChangePage(event) {
    const {id} = event.target;
    renderNews(id);
}

$(nextPageBtn).click(onChangePage);
$(previousPageBtn).click(onChangePage);

refreshBtn.addEventListener('click', renderNews);
$(document).ready(renderNews);
