import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove, set } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"
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

        // User signed out successfully
        console.log("User signed out")

        sessionStorage.clear()
        Swal.fire('Logout Successfully', "Thank You", 'success');
        //VerificationEmail();
        checkAuthentication();
    }
    catch (error) {
        // Handle errors
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

        // userName.innerHTML = user.displayName;
        // userMail.innerHTML = "User Mail Id : " + user.email;
        // userImage.src = user.photoURL;
        // userData.style.visibility = "visible";
    } else {
        // User is not authenticated, handle accordingly
        console.log("Logged out")

    }
}


window.addEventListener('load', checkAuthentication)








var globalindex = 0;

document.addEventListener('DOMContentLoaded', () => {
    const users = JSON.parse(sessionStorage.getItem('user'))
    const todoInput = document.getElementById('new-todo');
    const addButton = document.getElementById('add-button');



    const addTodo = () => {
        const title = todoInput.value.trim();
        if (title) {
            document.getElementById("noData").style.display = "none"
            const user = JSON.parse(sessionStorage.getItem('user'))
            var inputValue = { title, completed: false }
            let userReference = ref(database, `usersData/${user.uid}/${globalindex}`)
            set(userReference, inputValue)
            globalindex += 1;
            todoInput.value = '';
        }
    };

    addButton.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    const user = JSON.parse(sessionStorage.getItem('user'))
    if (user) {
        const user = JSON.parse(sessionStorage.getItem('user'))
        renderWinsFromDatabase(user.uid);
    }
});


document.getElementById("googleButton").addEventListener("click", () => {
    signInWithGoogle();
})

document.getElementById("logoutButton").addEventListener("click", () => {
    signOutFromApp()
    setTimeout(() => { location.reload() }, 2000)

})


window.toggleComplete = (index) => {
    const user = JSON.parse(sessionStorage.getItem('user'))
    const userId = user.uid;
    let userWinsRef = ref(database, `usersData/${userId}/${index}/completed`);
    set(userWinsRef, "true")

};
window.deleteTodo = (index) => {
    const user = JSON.parse(sessionStorage.getItem('user'))
    const userId = user.uid;
    let userWinsRef = ref(database, `usersData/${userId}/${index}`);
    remove(userWinsRef)
};

function renderWinsFromDatabase(userId) {
    let userWinsRef = ref(database, `usersData/${userId}`)
    onValue(userWinsRef, function (snapshot) {
        if (snapshot.exists()) {

            // winsFeed.innerHTML = ""

            const todoList = document.getElementById('todo-list');
            const winsObj = snapshot.val();
            const todos = Object.values(winsObj);
            function renderTodos() {
                todoList.innerHTML = '';
                // var todos = []
                todos.forEach((todo, index) => {
                    const li = document.createElement('li');
                    li.className = todo.completed ? 'completed' : '';
                    li.innerHTML = `
           <div>
           <span>${todo.title}</span>
           <div>
               <button onclick="toggleComplete(${index})">${todo.completed ? 'Undo' : 'Complete'}</button>
               <button onclick="deleteTodo(${index})">Delete</button>
           </div>
           </div>
        `;
                    todoList.appendChild(li);
                });
            }
            renderTodos()

        } else {
            document.getElementById("noData").innerText = "No records here... yet"
        }
    })
}

document.getElementById("getData").addEventListener("click", () => {
    // const user = JSON.parse(sessionStorage.getItem('user'))
    // renderWinsFromDatabase(user.uid);
})