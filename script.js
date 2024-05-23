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






var localTodo = []


document.addEventListener('DOMContentLoaded', () => {
    const users = JSON.parse(sessionStorage.getItem('user'))
    const todoInput = document.getElementById('new-todo');
    const addButton = document.getElementById('add-button');



    const addTodo = () => {
        const title = todoInput.value.trim();
        if (title) {
            document.getElementById("noData").style.display = "none"
            const user = JSON.parse(sessionStorage.getItem('user'))
            var inputValue = { title: title, completed: false }
            localTodo.push(inputValue)
            saveTodos()
            let userReference = ref(database, `usersData/${user.uid}`)
            push(userReference, inputValue);
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
const saveTodos = () => {
    localStorage.setItem('localTodo', JSON.stringify(localTodo));
};

window.toggleComplete = (key) => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const userId = user.uid;
    let userWinsRef = ref(database, `usersData/${userId}/${key}`);
    let final = ref(database, `usersData/${userId}/${key}/completed`);
    let completedValue = ""; // Initialize it here

    get(userWinsRef).then((snapshot) => {
        if (snapshot.exists()) {
            // Data exists at the specified location
            const completedData = snapshot.val();
            // Do something with the retrieved data
            completedValue = (completedData.completed === "true") ? "false" : "true"; // Toggle the value
        } else {
            // Data does not exist at the specified location
            console.log("No data available");
        }
        return set(final, completedValue); // Return the set operation
    }).catch((error) => {
        console.error("Error getting data:", error);
    });

};
window.deleteTodo = (key) => {
    console.log("deleted")
    const user = JSON.parse(sessionStorage.getItem('user'))
    const userId = user.uid;
    let userWinsRef = ref(database, `usersData/${userId}/${key}`);
    remove(userWinsRef)
    renderWinsFromDatabase(userId)
};

function renderWinsFromDatabase(userId) {
    let userWinsRef = ref(database, `usersData/${userId}`)
    onValue(userWinsRef, function (snapshot) {
        if (snapshot.exists()) {
            document.getElementById("todo-list").style.height="200px";
            const todoList = document.getElementById('todo-list');
            todoList.innerHTML = "";
            const winsObj = snapshot.val();
            const length = Object.keys(winsObj).length;
            for (const key in winsObj) {
                if (winsObj.hasOwnProperty(key)) {
                    // console.log(key + ": " + winsObj[key].title);
                    const li = document.createElement('li');
                    li.className = (winsObj[key].completed === "true") ? 'completed' : 'notcompleted';
                    li.innerHTML = `
           <div>
           <span>${winsObj[key].title}</span>
           <div>
           <button onclick="toggleComplete('${key}')">${(winsObj[key].completed === "true") ? 'Undo' : 'Complete'}</button>
           <button onclick="deleteTodo('${key}')">Delete</button>           
           </div>
           </div>
        `;
                    todoList.appendChild(li);
                }
            }

        } else {
            document.getElementById("noData").innerText = "No records here... yet";
            document.getElementById("todo-list").style.height="50px";
            document.getElementById("todo-list").innerText = "";
        }
    })
}