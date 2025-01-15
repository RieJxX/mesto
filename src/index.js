import logoImage from './images/logo.svg';
import { getUserInfo, getInitialCards, updateUserInfo, addCard, updateAvatar, deleteCard, addLike, removeLike } from './api.js';
import './pages/index.css';

const cardTemplate = document.querySelector('#card-template').content;
const cardList = document.querySelector('.places__list');

let userId;

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

  const isLiked = data.likes.some(like => like._id === userId);
  if (isLiked) {
    likeButton.classList.add('card__like-button_is-active');
  }

  likeButton.addEventListener('click', function () {
    const currentIsLiked = likeButton.classList.contains('card__like-button_is-active');
    if (currentIsLiked) {
      removeLike(data._id)
        .then(updatedCard => {
          likeButton.classList.remove('card__like-button_is-active');
          likeCount.textContent = updatedCard.likes.length;
        })
        .catch(err => console.log(err));
    } else {
      addLike(data._id)
        .then(updatedCard => {
          likeButton.classList.add('card__like-button_is-active');
          likeCount.textContent = updatedCard.likes.length;
        })
        .catch(err => console.log(err));
    }
  });

  if (data.owner._id === userId) {
    deleteButton.style.display = 'block';
    deleteButton.addEventListener('click', function () {
      deleteCard(data._id)
        .then(() => {
          cardElement.remove();
        })
        .catch(err => console.log(err));
    });
  } else {
    deleteButton.style.display = 'none';
  }

  cardImage.addEventListener('click', function () {
    openImagePopup(data.name, data.link);
  });

  return cardElement;
}

getUserInfo()
  .then(data => {
    userId = data._id
    document.querySelector('.profile__title').textContent = data.name;
    document.querySelector('.profile__description').textContent = data.about;
    document.querySelector('.profile__image').style.backgroundImage = `url(${data.avatar})`;
  })
  .catch(err => console.log(err));

getInitialCards()
  .then(cards => {
    cards.forEach(cardData => {
      cardList.append(createCard(cardData));
    });
  })
  .catch(err => console.log(err));

function openModal(popup) {
    popup.classList.add('popup_is-opened');
}

function closeModal(popup) {
    popup.classList.remove('popup_is-opened');
}

const profilePopup = document.querySelector('.popup_type_edit');
const profileTitle = document.querySelector('.profile__title');
const profileDescription = document.querySelector('.profile__description');
const nameInput = document.querySelector('.popup__input_type_name');
const jobInput = document.querySelector('.popup__input_type_description');
const profileForm = document.querySelector('form[name="edit-profile"]');

document.querySelector('.profile__edit-button').addEventListener('click', function () {
  nameInput.value = profileTitle.textContent;
  jobInput.value = profileDescription.textContent;
  openModal(profilePopup);
});

profilePopup.querySelector('.popup__close').addEventListener('click', function () {
  closeModal(profilePopup);
});

profileForm.addEventListener('submit', function (evt) {
  evt.preventDefault(); 

  const saveButton = profileForm.querySelector('.popup__button');
  saveButton.textContent = 'Сохранение...';

  updateUserInfo(nameInput.value, jobInput.value)
    .then(() => {
      profileTitle.textContent = nameInput.value;
      profileDescription.textContent = jobInput.value;
      closeModal(profilePopup);
    })
    .catch(err => console.log(err))
    .finally(() => {
      saveButton.textContent = 'Сохранить';
    });
});

const cardPopup = document.querySelector('.popup_type_new-card');
const cardForm = document.querySelector('form[name="new-place"]');
const cardNameInput = cardForm.querySelector('.popup__input_type_card-name');
const cardLinkInput = cardForm.querySelector('.popup__input_type_url');

document.querySelector('.profile__add-button').addEventListener('click', function () {
  cardForm.reset(); 
  openModal(cardPopup);
});

cardPopup.querySelector('.popup__close').addEventListener('click', function () {
  closeModal(cardPopup);
});

cardForm.addEventListener('submit', function (evt) {
  evt.preventDefault();
  const saveButton = cardForm.querySelector('.popup__button');
  saveButton.textContent = 'Сохранение...';
  addCard(cardNameInput.value, cardLinkInput.value)
    .then(newCardData => {
      const newCard = createCard(newCardData);
      cardList.prepend(newCard); 
      closeModal(cardPopup);
    })
    .catch(err => console.log(err)).finally(() => {
      saveButton.textContent = 'Сохранить';
    });
});

const imagePopup = document.querySelector('.popup_type_image');
const imagePopupImage = imagePopup.querySelector('.popup__image');
const imagePopupCaption = imagePopup.querySelector('.popup__caption');

function openImagePopup(name, link) {
  imagePopupImage.src = link;
  imagePopupImage.alt = name;
  imagePopupCaption.textContent = name;
  openModal(imagePopup);
}

imagePopup.querySelector('.popup__close').addEventListener('click', function () {
  closeModal(imagePopup);
});

const saveProfileButton = profileForm.querySelector('.popup__button');

function toggleProfileSaveButtonState() {
  saveProfileButton.disabled = !profileForm.checkValidity();
  const nameError = profilePopup.querySelector('.popup__error_type_name');
  const descriptionError = profilePopup.querySelector('.popup__error_type_description');

  if (nameInput.validity.valid) {
    nameError.style.display = 'none';
  } else {
    nameError.textContent = nameInput.validationMessage;
    nameError.style.display = 'block';
  }

  if (jobInput.validity.valid) {
    descriptionError.style.display = 'none';
  } else {
    descriptionError.textContent = jobInput.validationMessage;
    descriptionError.style.display = 'block';
  }
}

[nameInput, jobInput].forEach(input => {
  input.addEventListener('input', toggleProfileSaveButtonState);
});

const saveCardButton = cardForm.querySelector('.popup__button');

function toggleCardSaveButtonState() {
  saveCardButton.disabled = !cardForm.checkValidity(); 

  const cardNameError = cardPopup.querySelector('.popup__error_type_place-name');
  const cardLinkError = cardPopup.querySelector('.popup__error_type_link');

  console.log(cardNameError , cardLinkError , cardPopup)

  if (cardNameInput.validity.valid) {
    cardNameError.style.display = 'none';
  } else {
    cardNameError.textContent = cardNameInput.validationMessage;
    cardNameError.style.display = 'block';
  }

  if (cardLinkInput.validity.valid) {
    cardLinkError.style.display = 'none';
  } else {
    cardLinkError.textContent = cardLinkInput.validationMessage;
    cardLinkError.style.display = 'block';
  }
}

[cardNameInput, cardLinkInput].forEach(input => {
  input.addEventListener('input', toggleCardSaveButtonState);
});

const overlays = document.querySelectorAll('.popup');
overlays.forEach(popup => {
  popup.addEventListener('click', function (evt) {
    if (evt.target === popup) {
      closeModal(popup);
    }
  });
});

document.addEventListener('keydown', function (evt) {
  if (evt.key === 'Escape') {
    const openPopup = document.querySelector('.popup_is-opened');
    if (openPopup) {
      closeModal(openPopup);
    }
  }
});

const avatarForm = document.querySelector('.popup__form_avatar'); 
const avatarInput = avatarForm.querySelector('.popup__input_type_avatar');
const avatarImage = document.querySelector('.profile__image'); 
const saveButton = avatarForm.querySelector('.popup__button'); 

const editAvatarButton = document.querySelector('.profile__edit-avatar-button'); 
const avatarPopup = document.querySelector('.popup_type_avatar'); 
const closePopupButton = avatarPopup.querySelector('.popup__close'); 

function toggleAvatarSaveButtonState() {
  saveButton.disabled = !avatarForm.checkValidity(); 

  const avatarError = avatarForm.querySelector('.popup__error_type_avatar');
  
  if (avatarInput.validity.valid) {
    avatarError.style.display = 'none';
  } else {
    avatarError.textContent = avatarInput.validationMessage;
    avatarError.style.display = 'block';
  }
}

avatarInput.addEventListener('input', toggleAvatarSaveButtonState);

const openPopup = (popup) => {
  popup.classList.add('popup_is-opened');
  document.body.style.overflow = 'hidden'; 
};

const closePopup = () => {
  avatarPopup.classList.remove('popup_is-opened');
  document.body.style.overflow = ''; 
};

editAvatarButton.addEventListener('click', () => {
  openPopup(avatarPopup);
});
closePopupButton.addEventListener('click', closePopup);


const handleAvatarSubmit = (event) => {
  event.preventDefault();
  const avatarUrl = avatarInput.value;
  saveButton.textContent = 'Сохранение...';
  updateAvatar(avatarUrl)
    .then(data => {
      avatarImage.style.backgroundImage = `url(${data.avatar})`;
      closePopup(); 
    })
    .catch(err => {
      console.error(err);
      alert('Произошла ошибка при смене аватара. Попробуйте снова.');
    })
    .finally(() => {
      saveButton.textContent = 'Сохранить';
    });
};

avatarForm.addEventListener('submit', handleAvatarSubmit);

document.querySelector('.logo').src = logoImage;
