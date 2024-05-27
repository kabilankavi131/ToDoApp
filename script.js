import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove, set, get } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, sendEmailVerification } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js"

const firebaseConfig = {
    apiKey: "AIzaSyAxzGou7yoIAtvvuszumGZNnsObni1wZQc",
    authDomain: "todoapp-540c7.firebaseapp.com",
    projectId: "todoapp-540c7",
    storageBucket: "todoapp-540c7.appspot.com",
    messagingSenderId: "137974596166",
    appId: "1:137974596166:web:81bc8bd7f97d40db8d0047",
    measurementId: "G-V9S385H6RF"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

const auth = getAuth(app)
const provider = new GoogleAuthProvider()
const contactDatainDB = ref(database, "usersData")





async function signInWithGoogle() {
    try {
        const response = await signInWithPopup(auth, provider)
        console.log("Everything worked", response)
        sessionStorage.setItem('user', JSON.stringify(response.user))


        console.log(auth.currentUser.uid)
        Swal.fire('Login Successfully', `Welcome to Kabilan's TODOAPP`, 'success');
        checkAuthentication();
    } catch (error) {
        // Handle errors
        console.error("Error signing in:", error)
    }
}





async function signOutFromApp() {
    try {
        await signOut(auth)


        console.log("User signed out")

        sessionStorage.clear()
        Swal.fire('Logout Successfully', "Thank You", 'success');

        checkAuthentication();
    }
    catch (error) {

        console.error("Error signing out:", error)
    }
}
function checkAuthentication() {
    const user = JSON.parse(sessionStorage.getItem('user'))
    if (user) {
        console.log("Logged in")
        console.log(user.uid)
        document.getElementById("googleButton").style.display = "none";
        document.getElementById("displayuserName").style.display = "block";
        document.getElementById("userName").innerHTML = user.displayName;
        document.getElementById("logoutButton").style.display = "block";
        // alert(user.email)
        // alert(user.photoURL)
        // alert(user.displayName);
    } else {
        console.log("Logged out")

    }
}


window.addEventListener('load', checkAuthentication)



document.addEventListener('DOMContentLoaded', () => {

    const randomNumber = Math.floor(Math.random() * 30) + 1;
    var imagesrc = "url(./Images/image" + randomNumber + ".jpg)";
    document.body.style.backgroundImage = imagesrc;
    const todoInput = document.getElementById('new-todo');
    const addButton = document.getElementById('add-button');



    const addTodo = () => {
        const title = todoInput.value.trim();
        const user = JSON.parse(sessionStorage.getItem('user'))
        if (title && user) {
            document.getElementById("noData").style.display = "none"
            var inputValue = { title: title, completed: false }
            let userReference = ref(database, `usersData/${user.uid}`)
            push(userReference, inputValue);
            todoInput.value = '';
            renderTodoFromDatabase(user.uid)
        }
        else {
            if (!user)
                Swal.fire('Please Sign Up', `Sign Up To use Your ToDOApp`, 'info');
        }

    };

    addButton.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    const user = JSON.parse(sessionStorage.getItem('user'))
    if (user) {
        const user = JSON.parse(sessionStorage.getItem('user'))
        renderTodoFromDatabase(user.uid);
    }
});


document.getElementById("googleButton").addEventListener("click", () => {
    signInWithGoogle();
})

document.getElementById("logoutButton").addEventListener("click", () => {
    signOutFromApp()
    setTimeout(() => { location.reload() }, 2000)

})


window.toggleComplete = (key) => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const userId = user.uid;
    let userTodoRef = ref(database, `usersData/${userId}/${key}`);
    let final = ref(database, `usersData/${userId}/${key}/completed`);
    let completedValue = "";

    get(userTodoRef).then((snapshot) => {
        if (snapshot.exists()) {

            const completedData = snapshot.val();

            completedValue = (completedData.completed === "true") ? "false" : "true";
        }
        return set(final, completedValue);
    }).catch((error) => {
        console.error("Error getting data:", error);
    });

};
window.deleteTodo = (key) => {
    console.log("deleted")
    const user = JSON.parse(sessionStorage.getItem('user'))
    const userId = user.uid;
    let userTodoRef = ref(database, `usersData/${userId}/${key}`);
    remove(userTodoRef)
};

function renderTodoFromDatabase(userId) {
    let userTodoRef = ref(database, `usersData/${userId}`)
    onValue(userTodoRef, function (snapshot) {
        if (snapshot.exists()) {
            document.getElementById("todo-list").style.height = "200px";
            const todoList = document.getElementById('todo-list');
            todoList.innerHTML = "";
            const todoObj = snapshot.val();
            // const length = Object.keys(todoObj).length;
            for (const key in todoObj) {
                if (todoObj.hasOwnProperty(key)) {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <div>
                            <span class="usertodocompleted" data-key="${key}">${todoObj[key].title}</span>
                            <br>
                            <div class="twoButtons">
                                <button onclick="toggleComplete('${key}')">${(todoObj[key].completed === "true") ? 'Undo' : 'Complete'}</button>
                                <button onclick="deleteTodo('${key}')">Delete</button>
                            </div>
                        </div>
                    `;
                    todoList.appendChild(li);
                }
            }

            const items = document.querySelectorAll('.usertodocompleted');
            items.forEach(item => {
                const key = item.getAttribute('data-key');
                item.className = `usertodocompleted ${(todoObj[key].completed === "true") ? 'completed' : 'notcompleted'}`;
            });


        } else {
            document.getElementById("noData").innerText = "No records here... yet";
            document.getElementById("todo-list").style.height = "50px";
            document.getElementById("todo-list").innerText = "";
        }
    })
}