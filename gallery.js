const selectedToRemove = [];

const fileUploadLimit = 1048576; // 1MB in bytes. Formula: 1MB = 1 * 1024 * 1024.

const galleryContainer = document.getElementById("gallery");
const lightBox = document.getElementById("ligthBox");
const selectBtn = document.getElementById("select");
const deleteBtn = document.getElementById("delete");

let currentPage = 1;
const itemsPerPage = 2;

document.addEventListener("DOMContentLoaded", () => {
    renderGallery();
});

// LightBox closed
lightBox.addEventListener("click", () => {
    lightBox.style.transform = "translateY(-100%)";
});

// Delete images 
deleteBtn.addEventListener("click", (e) => {
    let checkboxesHtml = document.getElementsByClassName("checkbox");
    let checkboxes = Array.from(checkboxesHtml);

    for (let checkbox of checkboxes) {
        if (checkbox.checked) {
            let key = checkbox.dataset.key;
            dbDelete(key);

            checkbox.parentElement.remove();
        }
    }

    renderGallery();
});

//Upload and save images to localStorage
document.querySelector("#upload_images").addEventListener("change", uploadAndSave);

function  uploadAndSave() {
    let fileInput = document.querySelector("input[type=file]");

    let file = fileInput.files[0];
    if (!file) {
        return;
    }
    let allert = document.getElementById("allert");

    if (file.size <= fileUploadLimit) {
        let reader = new FileReader();

        reader.addEventListener("load", () => {
            let image = new Image();
            image.title = file.name;
            image.src = reader.result;

            dbAdd(image.title, image);

            renderGallery();
        });
        reader.readAsDataURL(file); 

        allert.style = "display: none;";
    } else {
        allert.style = "display: block;"
    }
}

// Read image data stored in localStorage
function getImages(imageKeys) {
    let images = [];

    if (imageKeys.length == 0) {
        return images
    }

    for (let i = 0; i < imageKeys.length; i++) {
        let imageName = imageKeys[i];
        let img = dbGet(imageName);
        images.push({img: img, key: imageName});
    }

    return images;
}

// Render image in HTML ***Pagination need to be done
function renderGallery() {
    let imageKeys = JSON.parse(localStorage.getItem("images")) || [];
    if ((currentPage > Math.ceil(imageKeys.length / itemsPerPage)) && (currentPage > 1)) {
        currentPage--;
    }
    let startIndex = (currentPage - 1) * itemsPerPage;
    
    let endIndex = startIndex + itemsPerPage;

    let imageKeysForDisplay = imageKeys.slice(startIndex, endIndex);

    let imagesData = getImages(imageKeysForDisplay);

    galleryContainer.innerHTML = "";

    imagesData.forEach((imageData) => {
        let image = imageData.img;
        let imageContainer = document.createElement("div");
        imageContainer.className = "image_wrap";
        imageContainer.dataset.key = imageData.key;

        let checkBtn = document.createElement("input");
        checkBtn.type = "checkbox";
        checkBtn.name = "selectToRemove";
        checkBtn.value = "remove";
        checkBtn.id = imageData.key;
        checkBtn.className = "checkbox";
        checkBtn.dataset.key = imageData.key;

        galleryContainer.appendChild(imageContainer);
        imageContainer.appendChild(imageData.img);
        imageContainer.appendChild(checkBtn);

        image.className = "gallery_image";


        // Select image to delete 
        checkBtn.addEventListener("click", () => {
            if (checkBtn.checked == true){
                imageContainer.className = "image_wrap selected";
                if (deleteBtn.disabled) {
                    deleteBtn.disabled = false;
                }
            } else {
                imageContainer.className = "image_wrap";
                if (!deleteBtn.disabled) {
                    deleteBtn.disabled = true;
                }
            }
        })
        
        
        // LightBox appear
        image.addEventListener("click", () => {
            let selectedImage = document.getElementById("selectedImg");

            selectedImage.src = image.src;
            selectedImage.alt = image.alt;
            lightBox.style.transform = "translateY(0)";
        });
    });

    if (imagesData.length === 0) {
        let emptyGallery = document.getElementById("empty_gallery");
        emptyGallery.style = "display: block;"
    } else {
        let emptyGallery = document.getElementById("empty_gallery");
        emptyGallery.style = "display: none";
    }

    pagination(); 
}

// Create pagination
function pagination() {

    let images = JSON.parse(localStorage.getItem("images")) || [];
    let nav = document.getElementById("pagination");

    function loadPageNav() {
        nav.innerHTML = "";
        
        let numberOfPages = Math.ceil(images.length / itemsPerPage);

        let paginationData = dotsPagination(currentPage, numberOfPages);

        for (let item of paginationData) {
            let pageLink = document.createElement("li");
            pageLink.innerText = item;

            nav.append(pageLink);

            if (item !== "...") {
                if (Number(item) === currentPage) {
                    pageLink.className = "active";
                }

                pageLink.addEventListener("click", (e) => {
                    currentPage = Number(e.target.innerText);
                    renderGallery();
                });
            } else {
                pageLink.className = "dots";
            }
        }
    }

    loadPageNav();
}

function dotsPagination(c, m) {
    var current = c,
        last = m,
        delta = 2,
        left = current - delta,
        right = current + delta + 1,
        range = [],
        rangeWithDots = [],
        l;

    for (let i = 1; i <= last; i++) {
        if (i == 1 || i == last || i >= left && i < right) {
            range.push(i);
        }
    }

    for (let i of range) {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
                rangeWithDots.push("...");
            }
        }
        rangeWithDots.push(i);
        l = i;
    }

    return rangeWithDots;
}

// DB
function dbAdd(key, image) {
    let imageNames = JSON.parse(localStorage.getItem("images")) || [];

    localStorage.setItem(key, image.src);

    imageNames.unshift(key);
    localStorage.setItem("images", JSON.stringify(imageNames));
}

function dbDelete(key) {
    let images = JSON.parse(localStorage.getItem("images"));

    let imageIndex = images.indexOf(key);

    images.splice(imageIndex, 1);
    localStorage.removeItem(key);

    localStorage.setItem("images", JSON.stringify(images));
}

function dbGet(key) {
    let img = new Image();
    img.src = localStorage.getItem(key);
    img.alt = key.split(".")[0];
    img.title = key;

    return img;
}




