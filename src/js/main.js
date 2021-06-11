import ImagesApiService from './apiService';
import imageCardTpl from '../template/image-card.hbs';
import imageLightboxTpl from '../template/image-lightbox.hbs';
import debounce from 'lodash.debounce';
import * as basicLightbox from 'basiclightbox';
import { error } from '@pnotify/core/dist/PNotify.js';

const refs = {
  searchFormInput: document.querySelector('.js-input-image-query'),
  imagesRenderCard: document.querySelector('.gallery'),
  loaderEllips: document.querySelector('.loader-ellips'),
  // imageClickItem: document.querySelector('.gallery-item'),
};

const imageApiService = new ImagesApiService();

const onEntry = entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && imageApiService.query !== '') {
      imageApiService
        .fetchImagesApi()
        .then(images => {
          addloaderEllipsClass();
          renderImages(images);
        })
        .catch(onFetchError);
      removeloaderEllipsClass();
      console.log('need to load more image');
    }
  });
};

const option = {
  rootMargin: '250px',
};
const observer = new IntersectionObserver(onEntry, option);

observer.observe(refs.loaderEllips);

let imageClick;

refs.searchFormInput.addEventListener('input', debounce(onSearch, 500));
refs.imagesRenderCard.addEventListener('click', setImageLightbox);

function onSearch(e) {
  e.preventDefault();
  refs.imagesRenderCard.innerHTML = '';
  imageApiService.query = e.target.value;
  if (e.target.value === '') {
    return;
  }
  imageApiService.resetPage();
  imageApiService
    .fetchImagesApi()
    .then(images => {
      clearImagesContainer();
      addloaderEllipsClass();
      renderImages(images);
      // let imageClickItem = document.querySelectorAll('.gallery-item');
      console.log(images);
    })
    .catch(onFetchError);
  removeloaderEllipsClass();
}

console.log(imageClick);

function renderImages(images) {
  refs.imagesRenderCard.insertAdjacentHTML('beforeend', imageCardTpl(images));
  console.log(images);
}

function onFetchError(err) {
  error({
    title: 'Error. Something went wrong. Try again later or reload the page',
  });
}

function clearImagesContainer() {
  refs.imagesRenderCard.innerHTML = '';
}

function addloaderEllipsClass() {
  refs.loaderEllips.classList.add('is-hidden');
}

function removeloaderEllipsClass() {
  refs.loaderEllips.classList.remove('is-hidden');
}

function setImageLightbox(e) {
  const imageDataAttribute = {
    imageAttribute: e.target.dataset,
  };
  const instance = basicLightbox.create(imageLightboxTpl(imageDataAttribute));
  instance.show();
}
