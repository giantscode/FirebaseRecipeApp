const moment = require('moment'); //grab momentJS

const list = document.querySelector(`ul`);
const form = document.querySelector(`form`);
const stopButton = document.querySelector(`.stop-live`);

const addRecipe = (recipe, id) => {
    let time = moment(recipe.created_at.toDate()).format('MMMM Do YYYY, h:mm:ss a');
    let html = `
        <li data-id="${id}">
            <div>
                ${recipe.title}
            </div>
            <div>Created on ${time}</div>
            <button class="btn btn-danger btn-sm my-2">Delete Item</button>
        </li>
    `;

    list.innerHTML += html;
    
};

const deleteRecipe = (id) => {
    const recipes = document.querySelectorAll(`li`);
    recipes.forEach(recipe => {
        if (recipe.getAttribute(`data-id`) === id) {
            recipe.remove();
        }
    });
}

//Reference db from firebase script in index.html:
//Get documents (live):
const stopLive = db.collection(`recipes`).onSnapshot(snapshot => {
    console.log(snapshot.docChanges());
    snapshot.docChanges().forEach(change => {
        const doc = change.doc;
        console.log(doc);
        if (change.type === `added`) {
            addRecipe(doc.data(), doc.id);
        }
        else if (change.type === `removed`) {
            deleteRecipe(doc.id);
        }
    })
});


//Only retrieves from the start (not live):
// db.collection(`recipes`).get()//returns promise
//     .then((snapshot) => {
//         //when we have the data, go through each one and log to console:
//         snapshot.docs.forEach(doc => {
//             addRecipe(doc.data(), doc.id);
//         });
//     }).catch((err) => {
//         console.log(err);
//     });

//Add Documents:
form.addEventListener(`submit`, e => {
    e.preventDefault();

    const now = new Date();
    const recipe = {
        title: form.recipe.value,
        created_at: firebase.firestore.Timestamp.fromDate(now)
    };

    db.collection(`recipes`).add(recipe).then(() => {
        console.log(`recipe added`);
    }).catch(err => {
        console.log(err);
    });

});

//Delete item:
list.addEventListener(`click`, e => {
    console.log(e);
    if (e.target.tagName === `BUTTON`) {
        const id = e.target.parentElement.getAttribute(`data-id`);
        console.log(id);
        db.collection(`recipes`).doc(id).delete().then(() => {
            console.log(`recipe delete`);
        });
    }
});


//Stop live database changes:

stopButton.addEventListener(`click`, () => {
    stopLive();
    console.log(`stop successful`);
});