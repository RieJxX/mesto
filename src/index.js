import logoImage from './images/logo.svg';
import {
  getUserInfo,
  getInitialCards,
  updateUserInfo,
  addCard,
  updateAvatar,
  deleteCard,
  addLike,
  removeLike
} from './api.js';
import './pages/index.css';

const cardTemplate = document.querySelector('#card-template').content;
const cardList = document.querySelector('.places__list');
const profilePopup = document.querySelector('.popup_type_edit');
const profileTitle = document.querySelector('.profile__title');
const profileDescription = document.querySelector('.profile__description');
const nameInput = document.querySelector('.popup__input_type_name');
const jobInput = document.querySelector('.popup__input_type_description');
const profileForm = document.querySelector('form[name="edit-profile"]');
const saveProfileButton = profileForm.querySelector('.popup__button');
const cardPopup = document.querySelector('.popup_type_new-card');
const cardForm = document.querySelector('form[name="new-place"]');
const cardNameInput = cardForm.querySelector('.popup__input_type_card-name');
const cardLinkInput = cardForm.querySelector('.popup__input_type_url');
const saveCardButton = cardForm.querySelector('.popup__button');
const imagePopup = document.querySelector('.popup_type_image');
const imagePopupImage = imagePopup.querySelector('.popup__image');
const imagePopupCaption = imagePopup.querySelector('.popup__caption');
const avatarPopup = document.querySelector('.popup_type_avatar');
const avatarForm = document.querySelector('.popup__form_avatar');
const avatarInput = avatarForm.querySelector('.popup__input_type_avatar');
const avatarImage = document.querySelector('.profile__image');
const saveAvatarButton = avatarForm.querySelector('.popup__button');
const editAvatarButton = document.querySelector('.profile__edit-avatar-button');

let userId;

function openModal(popup) {
  popup.classList.add('popup_is-opened');
  document.body.style.overflow = 'hidden';
}

function closeModal(popup) {
  popup.classList.remove('popup_is-opened');
  document.body.style.overflow = '';
}

function resetForm(form, popup) {
  form.reset();
  clearValidationErrors(popup);
}

function clearValidationErrors(popup) {
  const errors = popup.querySelectorAll('.popup__error');
  errors.forEach((error) => (error.style.display = 'none'));
}

function createCard(data) {
  const cardElement = cardTemplate.querySelector('.card').cloneNode(true);
  const cardImage = cardElement.querySelector('.card__image');
  const cardTitle = cardElement.querySelector('.card__title');
  const deleteButton = cardElement.querySelector('.card__delete-button');
  const likeButton = cardElement.querySelector('.card__like-button');
  const likeCount = cardElement.querySelector('.card__like-count');

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardTitle.textContent = data.name;
  likeCount.textContent = data.likes.length;

  const isLiked = data.likes.some((like) => like._id === userId);
  if (isLiked) likeButton.classList.add('card__like-button_is-active');

  likeButton.addEventListener('click', () => handleLike(data, likeButton, likeCount));

  if (data.owner._id === userId) {
    deleteButton.style.display = 'block';
    deleteButton.addEventListener('click', () => handleDeleteCard(data, cardElement));
  } else {
    deleteButton.style.display = 'none';
  }

  cardImage.addEventListener('click', () => openImagePopup(data.name, data.link));

  return cardElement;
}

function handleLike(data, likeButton, likeCount) {
  const isLiked = likeButton.classList.contains('card__like-button_is-active');
  const likeAction = isLiked ? removeLike : addLike;

  likeAction(data._id)
    .then((updatedCard) => {
      likeButton.classList.toggle('card__like-button_is-active');
      likeCount.textContent = updatedCard.likes.length;
    })
    .catch(console.error);
}

function handleDeleteCard(data, cardElement) {
  deleteCard(data._id)
    .then(() => cardElement.remove())
    .catch(console.error);
}

function handleProfileSubmit(evt) {
  evt.preventDefault();
  saveProfileButton.textContent = 'Сохранение...';

  updateUserInfo(nameInput.value, jobInput.value)
    .then(() => {
      profileTitle.textContent = nameInput.value;
      profileDescription.textContent = jobInput.value;
      closeModal(profilePopup);
    })
    .catch(console.error)
    .finally(() => {
      saveProfileButton.textContent = 'Сохранить';
    });
}

function toggleProfileSaveButtonState() {
  saveProfileButton.disabled = !profileForm.checkValidity();
  updateFieldValidationState(nameInput, '.popup__error_type_name', profilePopup);
  updateFieldValidationState(jobInput, '.popup__error_type_description', profilePopup);
}

function handleCardSubmit(evt) {
  evt.preventDefault();
  saveCardButton.textContent = 'Сохранение...';

  addCard(cardNameInput.value, cardLinkInput.value)
    .then((newCardData) => {
      cardList.prepend(createCard(newCardData));
      closeModal(cardPopup);
    })
    .catch(() => {
      const errorElement = cardForm.querySelector('.popup__error_type_link');
      errorElement.style.display = 'block'
      errorElement.textContent = 'Картинка имеет неверный URL'
    })
    .finally(() => {
      saveCardButton.textContent = 'Сохранить';
    });
}

function toggleCardSaveButtonState() {
  saveCardButton.disabled = !cardForm.checkValidity();
  updateFieldValidationState(cardNameInput, '.popup__error_type_place-name', cardPopup);
  updateFieldValidationState(cardLinkInput, '.popup__error_type_link', cardPopup);
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  saveAvatarButton.textContent = 'Сохранение...';

  updateAvatar(avatarInput.value)
    .then((data) => {
      avatarImage.style.backgroundImage = `url(${data.avatar})`;
      closeModal(avatarPopup);
    })
    .catch((err) => {
      const errorElement = avatarForm.querySelector('.popup__error_type_avatar');
      errorElement.style.display = 'block'
      errorElement.textContent = 'Картинка имеет неверный URL'
    })
    .finally(() => {
      saveAvatarButton.textContent = 'Сохранить';
    });
}

function toggleAvatarSaveButtonState() {
  saveAvatarButton.disabled = !avatarForm.checkValidity();
  updateFieldValidationState(avatarInput, '.popup__error_type_avatar', avatarPopup);
}

function updateFieldValidationState(input, errorSelector, popup) {
  const errorElement = popup.querySelector(errorSelector);

  if (input.value === '' || input.validity.valid) {
    errorElement.style.display = 'none';
  } else {
    errorElement.textContent = input.validationMessage;
    errorElement.style.display = 'block';
  }
}

function openImagePopup(name, link) {
  imagePopupImage.src = link;
  imagePopupImage.alt = name;
  imagePopupCaption.textContent = name;
  openModal(imagePopup);
}

profileForm.addEventListener('submit', handleProfileSubmit);
[nameInput, jobInput].forEach((input) => input.addEventListener('input', toggleProfileSaveButtonState));

cardForm.addEventListener('submit', handleCardSubmit);
[cardNameInput, cardLinkInput].forEach((input) => input.addEventListener('input', toggleCardSaveButtonState));

avatarForm.addEventListener('submit', handleAvatarSubmit);
avatarInput.addEventListener('input', toggleAvatarSaveButtonState);

document.querySelector('.profile__edit-button').addEventListener('click', () => {
  nameInput.value = profileTitle.textContent;
  jobInput.value = profileDescription.textContent;
  toggleProfileSaveButtonState();
  openModal(profilePopup);
});

document.querySelector('.profile__add-button').addEventListener('click', () => {
  resetForm(cardForm, cardPopup);
  toggleCardSaveButtonState();
  openModal(cardPopup);
});

editAvatarButton.addEventListener('click', () => {
  resetForm(avatarForm, avatarPopup);
  toggleAvatarSaveButtonState();
  openModal(avatarPopup);
});

document.querySelectorAll('.popup__close').forEach((button) =>
  button.addEventListener('click', (evt) => closeModal(evt.target.closest('.popup')))
);

document.addEventListener('keydown', (evt) => {
  if (evt.key === 'Escape') {
    const openPopup = document.querySelector('.popup_is-opened');
    if (openPopup) closeModal(openPopup);
  }
});

document.querySelectorAll('.popup').forEach((popup) =>
  popup.addEventListener('click', (evt) => {
    if (evt.target === popup) closeModal(popup);
  })
);

getUserInfo()
  .then((data) => {
    userId = data._id;
    profileTitle.textContent = data.name;
    profileDescription.textContent = data.about;
    avatarImage.style.backgroundImage = `url(${data.avatar})`;
  })
  .catch(console.error);

getInitialCards()
  .then((cards) => {
    cards.forEach((cardData) => cardList.append(createCard(cardData)));
  })
  .catch(console.error);

document.querySelector('.logo').src = logoImage;
