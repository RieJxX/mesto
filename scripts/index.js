const cardTemplate = document.querySelector('#card-template').content;
const cardList = document.querySelector('.places__list');

const profilePopup = document.querySelector('.popup_type_edit');
const profileTitle = document.querySelector('.profile__title');
const profileDescription = document.querySelector('.profile__description');
const nameInput = document.querySelector('.popup__input_type_name');
const jobInput = document.querySelector('.popup__input_type_description');
const profileForm = document.querySelector('form[name="edit-profile"]');

const cardPopup = document.querySelector('.popup_type_new-card');
const cardForm = document.querySelector('form[name="new-place"]');
const cardNameInput = cardForm.querySelector('.popup__input_type_card-name');
const cardLinkInput = cardForm.querySelector('.popup__input_type_url');

const imagePopup = document.querySelector('.popup_type_image');
const imagePopupImage = imagePopup.querySelector('.popup__image');
const imagePopupCaption = imagePopup.querySelector('.popup__caption');

function createCard(data) {
  const cardElement = cardTemplate.querySelector('.card').cloneNode(true); 
  const cardImage = cardElement.querySelector('.card__image');
  const cardTitle = cardElement.querySelector('.card__title');
  
  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardTitle.textContent = data.name;

  cardElement.querySelector('.card__like-button').addEventListener('click', function (evt) {
    evt.target.classList.toggle('card__like-button_is-active');
  });

  cardElement.querySelector('.card__delete-button').addEventListener('click', function () {
    cardElement.remove();
  });

  cardImage.addEventListener('click', function () {
    openImagePopup(data.name, data.link);
  });

  return cardElement;
}

initialCards.forEach(cardData => {
    cardList.append(createCard(cardData));
  });

function openModal(popup) {
    popup.classList.add('popup_is-opened');
}

function closeModal(popup) {
    popup.classList.remove('popup_is-opened');
}

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

  profileTitle.textContent = nameInput.value;
  profileDescription.textContent = jobInput.value;

  closeModal(profilePopup);
});

document.querySelector('.profile__add-button').addEventListener('click', function () {
  cardForm.reset(); 
  openModal(cardPopup);
});

cardPopup.querySelector('.popup__close').addEventListener('click', function () {
  closeModal(cardPopup);
});

cardForm.addEventListener('submit', function (evt) {
  evt.preventDefault();

  const newCard = createCard({
    name: cardNameInput.value,
    link: cardLinkInput.value
  });

  cardList.prepend(newCard); 
  closeModal(cardPopup);
});

function openImagePopup(name, link) {
  imagePopupImage.src = link;
  imagePopupImage.alt = name;
  imagePopupCaption.textContent = name;
  openModal(imagePopup);
}

imagePopup.querySelector('.popup__close').addEventListener('click', function () {
  closeModal(imagePopup);
});