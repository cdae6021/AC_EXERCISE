const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12
const movies = []
let filteredMovies = []
const dataPanel = document.querySelector('#data-panel')
const paginator = document.querySelector('#paginator')

function renderMovieList(data) {
    let rawHTML = ''
    data.forEach(item => {
        rawHTML += `<div class="col-sm-3">
        <div class="mb-2">
            <div class="card">
                <img src="${POSTER_URL+item.image}" class="card-img-top" alt="Movie Poster" />
                <div class="card-body">
                    <h5 class="card-title">${item.title}</h5>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">
                      More
                    </button>
                    <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
                </div>
            </div>
        </div>
    </div>`
    });

    dataPanel.innerHTML = rawHTML
}

axios
    .get(INDEX_URL)
    .then((response) => {
        movies.push(...response.data.results)
        renderPaginator(movies.length)
        renderMovieList(getMovieByPage(1))
    })
    .catch((err) => console.log(err))



function showMovieModal(id) {
    const modalTitle = document.querySelector('#movie-modal-title')
    const modalImage = document.querySelector('#movie-modal-image')
    const modalDate = document.querySelector('#movie-modal-date')
    const modalDescription = document.querySelector('#movie-modal-description')

    axios.get(INDEX_URL + id).then((response) => {
        const data = response.data.results
        modalTitle.innerText = data.title
        modalDate.innerText = data.release_date
        modalDescription.innerText = data.description
        modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-pooster" class="img-fuid">`
    }).catch((error) => { console.log(error) })
}


function addToFavorite(id) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = movies.find((movie) => movie.id === id)
    if (list.some((movie) => movie.id === id)) {
        return alert('此電影已經在收藏清單中！')
    }
    list.push(movie)
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
}


dataPanel.addEventListener('click', function onPanelClick(event) {
    if (event.target.matches('.btn-show-movie')) {
        showMovieModal(Number(event.target.dataset.id))
    } else if (event.target.matches('.btn-add-favorite')) {
        addToFavorite(Number(event.target.dataset.id))
    }
})

const serchForm = document.querySelector('#search-form')
const serchInput = document.querySelector('#search-input')

serchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
    event.preventDefault();
    const keyWord = serchInput.value.trim().toLowerCase()

    filteredMovies = movies.filter((movie) => {
        return movie.title.toLowerCase().includes(keyWord)
    })
    if (filteredMovies.length === 0) {
        return alert(`您輸入的關鍵字 : ${keyWord} 沒有符合關鍵字的電影`)
    }
    renderPaginator(filteredMovies.length)
    renderMovieList(getMovieByPage(1))
    serchInput.value = ''
})


/////////////////////////////////////////////////////////////////////////////

function getMovieByPage(page) {

    const data = filteredMovies.length ? filteredMovies : movies
    const startIndex = (page - 1) * MOVIES_PER_PAGE
    const endIndex = startIndex + MOVIES_PER_PAGE
    return data.slice(startIndex, endIndex)
}

function renderPaginator(amount) {
    const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
    let rawHTML = ''
    for (let page = 1; page <= numberOfPages; page++) {
        rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
    }
    paginator.innerHTML = rawHTML

}

paginator.addEventListener('click', function onPaginatorClicked(event) {
    if (event.target.tagName != 'A') return;
    const page = event.target.dataset.page
    renderMovieList(getMovieByPage(Number(page)))
})