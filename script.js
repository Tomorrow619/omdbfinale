
document.addEventListener("DOMContentLoaded", function () {

    const navLinks = document.querySelectorAll('nav a'); // Все ссылки в навигации

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            // Удаляем класс active у всех ссылок
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            
            // Добавляем класс active к текущей ссылке
            event.currentTarget.classList.add('active');
        });
    });

    //Элементы 
    const main = document.getElementsByClassName("main")[0];
    const movieTittle = document.getElementsByClassName("movieTitle")[0];
    const similarMovieTitle = document.getElementsByClassName("movieTitle")[1];
    const movie = document.getElementsByClassName("movie")[0];



    //Кнопки
    const themeBtn = document.getElementById("themeChange");
    const searchBtn = document.getElementById("searchBtn");
    //Слушатели событий
    if (themeBtn) {
        themeBtn.addEventListener("click", themeChange);
    }
    if (searchBtn) {
        searchBtn.addEventListener("click", findMovie);
    }
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            findMovie()
        }
    })
    //Cмена темы
    function themeChange() {
        const body = document.querySelector("body")
        body.classList.toggle("dark")
    }


    //Поиск фильма
    async function findMovie() {
        let search = document.getElementsByName("search")[0].value;
        let loader = document.getElementsByClassName("loader")[0];
        loader.style.display = "block";
        let data = { apikey: "c00ec9e6", t: search };
        let result = await sendRequest("https://www.omdbapi.com/", "GET", data);
        loader.style.display = "none";

        if (result.Response == "False") {
            main.style.display = "block"
            movieTittle.style.display = "block";
            movieTittle.innerHTML = `${result.Error}`;
        } else {
            showMovie(result);
            findSimilarMovies()
            console.log(result)
        }
    }

    function showMovie(movie) {
        const movieTittle = document.getElementsByClassName("movieTitle")[0];
        main.style.display = "block";
        movieTittle.style.display = "block";
        document.getElementsByClassName("movie")[0].style.display = "flex";
        document.getElementById("movieImg").style.backgroundImage = `url(${movie.Poster})`;
        movieTittle.innerHTML = `${movie.Title}`
        const movieDesc = document.getElementsByClassName("movieDescription")[0];
        movieDesc.innerHTML = ""
        let params = [
            "imdbRating", "Year", "Released", "Genre", "Country", "Language", "Director", "Writer", "Actors",
        ]
        params.forEach((key) => {
            movieDesc.innerHTML +=
                `   <div class="desc">
                    <span class="tittle">${key}</span>
                    <span class="subtitle">${movie[key]}</span>
                </div>            `;

        }
        );
    }


    // Функция похожих фильмов 
    async function findSimilarMovies() {
        const search = document.getElementsByName("search")[0].value;
        const similarMovieTittle = document.getElementsByClassName("movieTitle")[1];
        const data = { apikey: "c00ec9e6", s: search };
        const result = await sendRequest("https://www.omdbapi.com/", "GET", data);
        console.log(result.Search);
        showSimilarMovies(result.Search);

        if (result.Response == "False") {

        } else {
            similarMovieTittle.style.display = "block";
            similarMovieTittle.innerHTML = `Найдено похожих фильмов: ${result.totalResults}`;
        }

    }
    function showSimilarMovies(movies) {
        const similarMovies = document.getElementsByClassName("similarMovie")[0];
        similarMovies.innerHTML = "";
        similarMovies.style.display = "grid"
        for (let i = 0; i < movies.length; i++) {
            const movie = movies[i];
            if (movie.Poster !== "N/A") {
                let similarMovie = ` 
             <div class="similarMovieCards" style="background-image: url('${movie.Poster}');">
            
                              <div class="saved" onclick ="addSaved(event)"
                                data-imdbID="${movie.imdbID}" data-title="${movie.Title}" data-poster="${movie.Poster}">
            
                                 </div>
                             <div class="similarMovieTittle" >
                             ${movie.Title}
                             </div>
            </div>
            `
                similarMovies.innerHTML += similarMovie
            }
        }

    }








    async function sendRequest(url, method, data) {
        if (method == "POST") {
            let response = await fetch(url, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })

            response = await response.json()
            return response
        } else if (method == "GET") {
            url = url + "?" + new URLSearchParams(data)
            let response = await fetch(url, {
                method: "GET"
            })
            response = await response.json()
            return response
        }
    }
});

//Функция избранное
// Обработчик события, добавляющий или удаляющий фильм из избранного
function addSaved(event) {
  const target = event.currentTarget;

  const movieData = {
    title: target.getAttribute("data-title"),
    poster: target.getAttribute("data-poster"),
    imdbID: target.getAttribute("data-imdbID"),
  };

  // Получаем текущие избранные фильмы
  const favs = JSON.parse(localStorage.getItem("favs")) || [];

  // Проверяем, есть ли уже фильм в избранном
  const movieIndex = favs.findIndex((movie) => movie.imdbID === movieData.imdbID);

  if (movieIndex > -1) {
    // Если фильм уже в избранном, удаляем его
    target.classList.remove("active"); // Убираем активный класс
    favs.splice(movieIndex, 1); // Удаляем фильм из массива избранного
    
    // Удаляем карточку из DOM
    removeCardFromFavorites(target);
  } else {
    // Если фильма нет в избранном, добавляем его
    target.classList.add("active"); // Добавляем активный класс
    favs.push(movieData); // Добавляем фильм в массив избранных
  }

  // Обновляем локальное хранилище
  localStorage.setItem("favs", JSON.stringify(favs));
}

// Функция для удаления карточки из DOM
function removeCardFromFavorites(target) {
  const imdbID = target.getAttribute("data-imdbID");
  
  // Находим контейнер для избранных фильмов
  const favCards = document.getElementsByClassName("favoritsCards")[0];
  
  // Ищем карточку, которая соответствует текущему imdbID
  const cardToRemove = Array.from(favCards.children).find(card => {
    return card.querySelector(".saved").getAttribute("data-imdbID") === imdbID;
  });

  if (cardToRemove) {
    // Удаляем карточку из DOM
    favCards.removeChild(cardToRemove);
  }
}

// Загружаем избранные фильмы при загрузке страницы
window.addEventListener("DOMContentLoaded", () => {
  const favs = JSON.parse(localStorage.getItem("favs")) || [];

  // Добавляем класс "active" к кнопкам сохранения для фильмов, которые уже в избранном
  favs.forEach((movie) => {
    const target = document.querySelector(`[data-imdbID="${movie.imdbID}"]`);
    if (target) {
      target.classList.add("active");
    }
  });
});

// Пример функции для отображения фильмов на странице (можно использовать для загрузки фильмов в избранное)
function displayFavorites() {
  const favs = JSON.parse(localStorage.getItem("favs")) || [];
  const favCards = document.getElementsByClassName("favoritsCards")[0];

  // Очищаем текущие карточки
  favCards.innerHTML = '';

  // Добавляем карточки для каждого фильма из избранного
  favs.forEach((movie) => {
    const card = document.createElement("div");
    const cardTitle = document.createElement("div");
    const saved = document.createElement("div");

    cardTitle.classList.add("favoritTitle");
    saved.classList.add("saved");
    card.classList.add("favoritsCard");

    cardTitle.innerHTML = movie.title;
    saved.setAttribute("data-imdbID", movie.imdbID);
    saved.setAttribute("data-title", movie.title);
    saved.setAttribute("data-poster", movie.poster);

    // Добавляем обработчик для кнопки сохранения
    saved.addEventListener("click", addSaved);

    card.style.backgroundImage = `url(${movie.poster})`;
    card.appendChild(cardTitle);
    card.appendChild(saved);
    favCards.appendChild(card);
  });
}

// Вызов функции отображения избранных фильмов
displayFavorites();


// function removeCardFromFavorites(target) {
    // Найти контейнер для избранных карточек
   // const favCards = document.getElementsByClassName("favoritsCards")[0];

    // Получаем imdbID для поиска карточки
  //  const imdbID = target.getAttribute("data-imdbID");

    // Ищем карточку, соответствующую imdbID
  //  const cardToRemove = Array.from(favCards.children).find(card => {
 //       return card.querySelector(".saved").getAttribute("data-imdbID") === imdbID;
 //   });

   // if (cardToRemove) {
        // Удаляем карточку из DOM
  //      favCards.removeChild(cardToRemove);
    //  }
//  }


//git 


