Vue.createApp({
    data() {
        return {
            title: "Home",
            usuario: null,
            usuarioEmail: "",
            usuarioFoto: "",
            usuarioNombre: "",
            juegos: [],
            categorias: [],
            comments: [],
            juegosFiltrados: [],
            busqueda: "",
            juegoActivo: [],
        }
    },
    created() {

    },
    mounted() {
        window.addEventListener("scroll", this.homeScroll);
        const lists = document.querySelectorAll('.hs');
        lists.forEach(el => {
            const listItems = el.querySelectorAll('li.item');
            const n = el.children.length;
            el.style.setProperty('--total', n);
        });
        // window.onload = function () {
        //     firebase.auth().onAuthStateChanged(function (user) {
        //         if (user) {
        //             this.usuario = user;
        //             document.getElementById('quickstart-sign-in').textContent = 'Sign out';
        //             document.getElementById('quickstart-google-sign-in').textContent = 'Sign out';
        //         } else {
        //             document.getElementById('quickstart-sign-in').textContent = 'Sign in';
        //             document.getElementById('quickstart-google-sign-in').textContent = 'Sign in with Google';
        //         }
        //         document.getElementById('quickstart-sign-in').disabled = false;
        //         document.getElementById('quickstart-google-sign-in').disabled = false;
        //     });
        // };

    },
    methods: {
        burgerToggle: function () {
            const hamburger = document.querySelector(".hamburger");
            const navMenu = document.querySelector(".nav-menu");
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        },
        toggleSignIn: function () {
            if (firebase.auth().currentUser) {
                firebase.auth().signOut();
            } else {
                var email = document.getElementById('email').value;
                var password = document.getElementById('password').value;
                if (email.length < 4) {
                    alert('Please enter an email address.');
                    return;
                }
                if (password.length < 4) {
                    alert('Please enter a password.');
                    return;
                }
                firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    if (errorCode === 'auth/wrong-password') {
                        alert('Wrong password.');
                    } else {
                        alert(errorMessage);
                    }
                    console.log(error);
                    document.getElementById('quickstart-sign-in').disabled = false;
                });
            }
            document.getElementById('quickstart-sign-in').disabled = true;
        },
        toggleGoogleSignIn: function () {
            if (!firebase.auth().currentUser) {
                var provider = new firebase.auth.GoogleAuthProvider();
                provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
                firebase.auth().signInWithPopup(provider).then(function (result) {
                    var token = result.credential.accessToken;
                    var user = result.user;
                }).catch(function (error) {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    var email = error.email;
                    var credential = error.credential;
                    if (errorCode === 'auth/account-exists-with-different-credential') {
                        alert('You have already signed up with a different auth provider for that email.');
                    } else {
                        console.error(error);
                    }
                });
            } else {
                firebase.auth().signOut();
            }
            document.getElementById('quickstart-google-sign-in').disabled = true;
        },
        handleSignUp: function () {
            var email = document.getElementById('email').value;
            var password = document.getElementById('password').value;
            if (email.length < 4) {
                alert('Please enter an email address.');
                return;
            }
            if (password.length < 4) {
                alert('Please enter a password.');
                return;
            }
            firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                if (errorCode == 'auth/weak-password') {
                    alert('The password is too weak.');
                } else {
                    alert(errorMessage);
                }
                console.log(error);
            }).then(function () {
                firebase.auth().currentUser.sendEmailVerification();
            });
        },
        sendPasswordReset: function () {
            var email = document.getElementById('email').value;
            firebase.auth().sendPasswordResetEmail(email).then(function () {
                alert('Password Reset Email Sent!');
            }).catch(function (error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                if (errorCode == 'auth/invalid-email') {
                    alert(errorMessage);
                } else if (errorCode == 'auth/user-not-found') {
                    alert(errorMessage);
                }
                console.log(error);
            });
        },
        addComments: function (juego) {
            let comentario = {
                comment: document.getElementById(`comment-${juego}`).value,
                game: juego,
                user: this.usuarioNombre || this.usuarioEmail,
                photo: this.usuarioFoto
            };
            let newCommentKey = firebase.database().ref().child('Comentarios').push().key;
            var update = {};
            update['Comentarios/' + newCommentKey] = comentario;
            firebase.database().ref().update(update);
            document.querySelectorAll('input[type="text"]').forEach(input => input.value = '');
        },
        returnLength: function (category) {
            return `--total: ${this.juegos.filter(juego => juego[1].categorias.includes(category)).length}`;
        },
        returnClass: function (name) {
            return `card-text ${name.length > 22 ? (name.length > 30 ? "two-lines-text" : "two-lines-text two-lines-short-text") : ""}`;
        },
        returnArrayLength: function (arr) {
            return `--total: ${arr.length}`;
        },
        homeScroll: function () {
            if (window.innerWidth < 768) {
                window.onscroll = function () {
                    if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
                        document.getElementsByTagName("header")[0].style.padding = "5px 10px 5px 10px";
                        document.getElementsByTagName('header')[0].style.backgroundImage = 'none';
                        document.getElementsByTagName('header')[0].style.background = 'var(--main-purple)';
                        document.getElementsByTagName('header')[0].style.background = 'radial-gradient(circle, var(--main-purple) 28%, var(--main-pink) 100%)';
                        document.getElementsByTagName("main")[0].style.marginTop = "211px";
                        document.getElementById("logo").style.display = "block";
                        document.getElementById("logo").style.width = "50px";
                        document.getElementById("logo").style.transform = "none";
                        document.getElementById("home-icon-container").style.alignSelf = "center";
                        document.getElementsByClassName("hamburger")[0].style.alignSelf = "center";
                        document.getElementsByClassName("nav-menu")[0].style.top = "5.7rem";
                    }
                    else {
                        document.getElementsByTagName("header")[0].style.padding = "10px 10px 100px 10px";
                        document.getElementsByTagName('header')[0].style.backgroundImage = 'none';
                        document.getElementsByTagName('header')[0].style.background = 'var(--main-purple)';
                        document.getElementsByTagName('header')[0].style.background = 'radial-gradient(circle, var(--main-purple) 28%, var(--main-pink) 100%)';
                        document.getElementsByTagName("main")[0].style.marginTop = "325px";
                        document.getElementById("logo").style.display = "block";
                        document.getElementById("logo").style.width = "50%";
                        document.getElementById("logo").style.transform = "translateY(50px)";
                        document.getElementsByClassName("hamburger")[0].style.alignSelf = "flex-start";
                        document.getElementById("home-icon-container").style.alignSelf = "flex-start";
                        document.getElementsByClassName("nav-menu")[0].style.top = "4.9rem";
                    }
                };
            }
        },
        gameScroll: function () {
            if (window.innerWidth < 768) {
                let gameImg = this.juegoActivo[1].imagen;
                window.onscroll = function () {
                    if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
                        document.getElementsByTagName("header")[0].style.padding = "5px 10px 5px 10px";
                        document.getElementsByTagName("header")[0].style.backgroundImage = "none";
                        document.getElementsByTagName("header")[0].style.background = "var(--main-purple)";
                        document.getElementsByTagName("header")[0].style.background = "radial-gradient(circle, var(--main-purple) 28%, var(--main-pink) 100%)";
                        document.getElementsByTagName("main")[0].style.marginTop = "211px";
                        document.getElementById("logo").style.display = "block";
                        document.getElementById("logo").style.transform = "none";
                        document.getElementById("logo").style.width = "50px";
                        document.getElementById("home-icon-container").style.alignSelf = "center";
                        document.getElementsByClassName("hamburger")[0].style.alignSelf = "center";
                        document.getElementsByClassName("nav-menu")[0].style.top = "5.7rem";
                    }
                    else {
                        document.getElementsByTagName("header")[0].style.padding = "10px 10px 135px 10px";
                        document.getElementsByTagName("header")[0].style.backgroundImage = `url(${gameImg})`;
                        document.getElementsByTagName("main")[0].style.marginTop = "200px";
                        document.getElementById("logo").style.display = "none";
                        document.getElementsByClassName("hamburger")[0].style.alignSelf = "flex-start";
                        document.getElementById("home-icon-container").style.alignSelf = "flex-start";
                        document.getElementsByClassName("nav-menu")[0].style.top = "4.9rem";
                    }
                };
            }
        },
        restoreHeader: function () {
            if (window.innerWidth < 768) {
                document.documentElement.style.overflow = "scroll";
                window.scrollTo(0, 0);
                document.getElementById("logo").style.display = "block";
                document.getElementById("logo").style.transform = "none";
                document.getElementById("logo").style.width = "50%";
                document.getElementById("logo").style.transform = "translateY(50px)";
                document.getElementsByTagName("main")[0].style.marginTop = "325px";
                document.getElementsByTagName('header')[0].style.backgroundImage = 'none';
                document.getElementsByTagName('header')[0].style.background = 'var(--main-purple)';
                document.getElementsByTagName('header')[0].style.background = 'radial-gradient(circle, var(--main-purple) 28%, var(--main-pink) 100%)';
                document.getElementsByTagName("header")[0].style.padding = "10px 10px 100px 10px";
                window.removeEventListener("scroll", this.gameScroll);
                window.addEventListener("scroll", this.homeScroll);
            }
        },
        removeHeader: function (imagen) {
            if (window.innerWidth < 768) {
                window.scrollTo(0, 0);
                document.getElementById("logo").style.display = "none";
                document.getElementsByTagName('header')[0].style.backgroundImage = `url(${imagen})`;
                document.getElementsByTagName("header")[0].style.padding = "10px 10px 135px 10px";
                document.getElementsByTagName("main")[0].style.marginTop = "200px";
                window.removeEventListener("scroll", this.homeScroll);
                window.addEventListener("scroll", this.gameScroll);
            }
        },
        destroyHeader: function () {
            if (window.innerWidth < 768) {
                document.documentElement.style.overflow = "hidden";
                window.removeEventListener("scroll", this.homeScroll);
                window.removeEventListener("scroll", this.gameScroll);
                document.getElementsByTagName("header")[0].style.padding = "5px 10px 5px 10px";
                document.getElementsByTagName('header')[0].style.backgroundImage = 'none';
                document.getElementsByTagName('header')[0].style.background = 'var(--main-purple)';
                document.getElementsByTagName('header')[0].style.background = 'radial-gradient(circle, var(--main-purple) 28%, var(--main-pink) 100%)';
                document.getElementsByTagName("main")[0].style.marginTop = "91px";
                document.getElementById("logo").style.display = "block";
                document.getElementById("logo").style.width = "50px";
                document.getElementById("logo").style.transform = "none";
                document.getElementById("home-icon-container").style.alignSelf = "center";
                document.getElementsByClassName("hamburger")[0].style.alignSelf = "center";
                document.getElementsByClassName("nav-menu")[0].style.top = "5.7rem";
            }
        }
    },
    computed: {
        checkLogin: function () {
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    this.usuario = user;
                    this.usuarioEmail = JSON.parse(JSON.stringify(this.usuario)).email;
                    (JSON.parse(JSON.stringify(this.usuario)).photoURL) ? (this.usuarioFoto = JSON.parse(JSON.stringify(this.usuario)).photoURL) : (this.usuarioFoto = "");
                    (JSON.parse(JSON.stringify(this.usuario)).displayName) ? (this.usuarioNombre = JSON.parse(JSON.stringify(this.usuario)).displayName) : (this.usuarioNombre = "");
                }
                else {
                    this.usuario = null;
                    this.usuarioEmail = "";
                    this.usuarioFoto = "";
                    this.usuarioNombre = "";
                }
            })
        },
        checkComments: function () {
            firebase.database().ref('Comentarios/').on("child_added", (data) => {
                let comentario = {
                    comment: data.val().comment,
                    game: data.val().game,
                    user: data.val().user,
                    photo: data.val().photo
                };
                this.comments = [...this.comments, comentario];
            });
        },
        loadAllGames: function () {
            firebase.database().ref('Juegos').on('value', (snapshot) => {
                this.juegos = Object.entries(snapshot.val());
            });
            this.juegos.length > 0 && this.juegos.forEach(juego => juego[1].categorias.forEach(cat => {
                !this.categorias.includes(cat) && (this.categorias = [...this.categorias, cat]);
            }));
        },
        autoSearch: function () {
            if (this.categorias.map(cat => cat.toUpperCase()).includes(this.busqueda.toUpperCase())) {
                this.juegosFiltrados = this.juegos.filter(juego => juego[1].categorias.map(cat => cat.toUpperCase()).includes(this.busqueda.toUpperCase()));
            }
            else {
                this.juegosFiltrados = this.juegos.filter(juego => juego[1].nombre.toUpperCase().includes(this.busqueda.toUpperCase()));
            };
        }
    }
}).mount('#app');