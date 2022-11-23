//TMDB 

const API_KEY = 'api_key=343775a37f99a91f012bd0992bcc9130';
const BASE_URL = 'https://api.themoviedb.org/3';
const API_URL = BASE_URL + '/discover/movie?sort_by=popularity.desc&'+API_KEY;
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const searchURL = BASE_URL + '/search/movie?'+API_KEY;

const main = document.getElementById('main');
const form =  document.getElementById('form');
const search = document.getElementById('search');

const genres= [{"id":28,"name":"Action"},{"id":35,"name":"Comedy"},{"id":80,"name":"Crime"},{"id":18,"name":"Drama"},{"id":36,"name":"History"},{"id":27,"name":"Horror"},{"id":10749,"name":"Romance"},{"id":10402,"name":"Music"},{"id":53,"name":"Thriller"}];
const tagsEle=document.getElementById('tags');

const prev=document.getElementById('prev');
const next=document.getElementById('next');
const current=document.getElementById('current');
var currentPage=1;
var nextPage=2;
var prevPage=3;
var last='';
var totalPages=100;

var selectedGenre=[];
setGenre();
function setGenre()
{
    tagsEle.innerHTML='';
    genres.forEach(genre=>{
        const t=document.createElement('div');
        t.classList.add('tag');
        t.id=genre.id;
        t.innerText=genre.name;
        t.addEventListener('click',()=>{
            if(selectedGenre.length==0)
            {selectedGenre.push(genre.id);}
            else
            {
                if(selectedGenre.includes(genre.id))
                {
                    selectedGenre.forEach((id,ind)=>{
                        if(id==genre.id)
                        {selectedGenre.splice(ind,1);}
                    });
                }
                else
                {selectedGenre.push(genre.id);}
            }
            getMovies(API_URL+'&with_genres='+encodeURI(selectedGenre.join(',')));
            highlight();
        });
        tagsEle.appendChild(t);

    })
}
function highlight()
{
    const tags=document.querySelectorAll('.tag');
    tags.forEach(tag=>{
        tag.classList.remove('highlight');
    });
    clearAll();
    if(selectedGenre.length!=0)
    {selectedGenre.forEach(id=>{
        const high=document.getElementById(id);
        high.classList.add('highlight');
    });
}
}

function clearAll()
{
    let btn=document.getElementById('clr');
    if(selectedGenre.length==0)
    {setGenre();}
    else if(btn)
    {
        btn.classList.add('highlight');
    }
    else
    {
        let clear=document.createElement('div');
    clear.classList.add('tag','highlight');
    clear.id='clr';
    clear.innerHTML='Clear';
    clear.addEventListener('click',()=>
    {
        selectedGenre=[];
        setGenre();
        getMovies(API_URL);
    })
    tagsEle.appendChild(clear);
    }
}

getMovies(API_URL);


function getMovies(url) {
    last=url;
    fetch(url).then(res => res.json()).then(data => {
        // console.log(data.results)
        if(data.results.length!=0)
        {
            showMovies(data.results);
            currentPage=data.page;
            nextPage=currentPage+1;
            prevPage=currentPage-1;
            totalPages=data.total_pages;
            current.innerText=currentPage;
            if(currentPage<=1) {prev.classList.add('disabled');
                    next.classList.remove('disabled');
        }
        else if(currentPage>=totalPages)
        {
            prev.classList.remove('disabled');
                    next.classList.add('disabled');
        }
        else
        {
            prev.classList.remove('disabled');
                    next.classList.remove('disabled');
        }
            tagsEle.scrollIntoView({behavior:'smooth'});
        }
        else
        {main.innerHTML=`<h1 style="color:white; position:relative;top:4em;">No Results Found</h1>`}
    })

}


function showMovies(data) {
    main.innerHTML = '';

    data.forEach(movie => {
        const {title, poster_path, vote_average, overview,id} = movie;
        const movieEl = document.createElement('div');
        movieEl.classList.add('movie');
        movieEl.innerHTML = `
             <img src="${poster_path?IMG_URL+poster_path: 'https://unlu.io/blog/wp-content/uploads/2021/06/movie-elements-black-background-with-empty-frame-scaled.jpg'}" alt="${title}">

            <div class="movie-info">
                <h3>${title}</h3>
                <span>${vote_average}</span>
            </div>

            <div class="overview">

                <h3>Overview</h3>
                ${overview?overview:'The overview is not provided by the API. You may get the movie description online.'};
                <br>
                <button class="know-more" id="${id}">Know More</button>
            </div>
        
        `
 
        main.appendChild(movieEl);
        document.getElementById(id).addEventListener('click',()=>{
            console.log(id);
            openNav(movie);
        })
    });
};

const overlayContent=document.getElementById('overlay-content');
/* Open when someone clicks on the span element */
function openNav(movie) {
    let id=movie.id;
    fetch(BASE_URL+'/movie/'+id+'/videos?'+API_KEY).then(res=>res.json()).then(videoData=>{
        console.log(videoData);
        if(videoData)
        document.getElementById("myNav").style.width = "100%";
        if(videoData.results.length>0)
        {
            var code='';
                let {key,name,site}=videoData.results[0];
                if(site=='YouTube')
                {code+=`
                <iframe width="560" height="315" src="https://www.youtube.com/embed/${key}" title="${name}" class="embed hide" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe> `;}
            overlayContent.innerHTML=code;
        }
        else{
            overlayContent.innerHTML=`<h1 style="color:white; position:relative;top:4em;">No Results Found</h1>`;
        }
    });
  }
  
  /* Close when someone clicks on the "x" symbol inside the overlay */
  function closeNav() {
    document.getElementById("myNav").style.width = "0%";
  }
  

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const searchTerm = search.value;
    selectedGenre=[];
    setGenre();
    if(searchTerm) {
        getMovies(searchURL+'&query='+searchTerm)
    }else{
        getMovies(API_URL);
    }

});

next.addEventListener('click',()=>{
    if(nextPage<=totalPages)
    {pageCall(nextPage);}
});

prev.addEventListener('click',()=>{
    if(prevPage>0)
    {pageCall(prevPage);}
});

function pageCall(page)
{
    let splitter=last.split('?');
    let query_para=splitter[1].split('&');
    let curr_num=query_para[query_para.length-1].split('=');
    if(curr_num[0]!='page')
    {let url=last+'&page='+page;
    getMovies(url);}
    else
    {
        curr_num[1]=page.toString();
        let a=curr_num.join('=');
        query_para[query_para.length-1]=a;
        let b=query_para.join('&');
        let url=splitter[0]+'?'+b;
        getMovies(url);
    }
}