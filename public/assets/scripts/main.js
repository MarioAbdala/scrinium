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
            juegosFiltrados: [],
            busqueda: "",
            juegoActivo: [],
            comments: [],
            favoritos: [],
            deseados: [],
            favorite: false,
            deseado: false,
            like: false,
            dislike: false
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
                this.title = "Home";
                Swal.fire(
                    'Logged in',
                    'Successful login',
                    'success'
                )
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
                    Swal.fire(
                        'Logged in',
                        'Successful login',
                        'success'
                    );
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
        signOut: function () {
            firebase.auth().signOut();
            this.title = "Home";
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
                comment: document.getElementById("comment").value,
                date: (new Date(Date.now())).toString().substring(4, 21),
                user: this.usuarioNombre || this.usuarioEmail,
                photo: this.usuarioFoto
            };
            this.comments = [...this.comments, comentario]
            let newCommentKey = firebase.database().ref(`Juegos/${juego}/comentarios`).push().key;
            var update = {};
            update[`Juegos/${juego}/comentarios/${newCommentKey}`] = comentario;
            firebase.database().ref().update(update);
            document.querySelectorAll('input[type="text"]').forEach(input => input.value = '');
        },
        favGame: function (juego) {
            let newFavKey = firebase.database().ref(`Juegos/${juego}/favoritos`).push().key;
            var update = {}
            update[`Juegos/${juego}/favoritos/${newFavKey}`] = this.usuario.uid;
            firebase.database().ref().update(update);
            this.favorite = true;
        },
        desiredGame: function (juego) {
            let newDesKey = firebase.database().ref(`Juegos/${juego}/deseados`).push().key;
            var update = {}
            update[`Juegos/${juego}/deseados/${newDesKey}`] = this.usuario.uid;
            firebase.database().ref().update(update);
            this.deseado = true;
        },
        removeFavGame: function (juego, favoritos) {
            if (favoritos) {
                Object.entries(favoritos).forEach(entry => {
                    if (entry[1] == this.usuario.uid) {
                        firebase.database().ref(`Juegos/${juego}/favoritos/${entry[0]}`).remove();
                        this.favorite = false;
                        // this.favoritos.filter(game => game[0] != juego);
                    }
                });
            };
        },
        removeDesGame: function (juego, deseados) {
            if (deseados) {
                Object.entries(deseados).forEach(entry => {
                    if (entry[1] == this.usuario.uid) {
                        firebase.database().ref(`Juegos/${juego}/deseados/${entry[0]}`).remove();
                        this.deseado = false;
                    }
                });
            };
        },
        loadCategory: function (categoria) {
            this.title = "Home";
            this.juegoActivo = [];
            this.busqueda = categoria;
            this.restoreHeader();
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
                window.removeEventListener("scroll", this.gameScroll);
                window.addEventListener("scroll", this.homeScroll);
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
            }
        },
        removeHeader: function (imagen) {
            if (window.innerWidth < 768) {
                document.documentElement.style.overflow = "scroll";
                window.removeEventListener("scroll", this.homeScroll);
                window.addEventListener("scroll", this.gameScroll);
                window.scrollTo(0, 0);
                document.getElementById("logo").style.display = "none";
                document.getElementsByTagName('header')[0].style.backgroundImage = `url(${imagen})`;
                document.getElementsByTagName("header")[0].style.padding = "10px 10px 135px 10px";
                document.getElementsByTagName("main")[0].style.marginTop = "200px";
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
        },
        generateContent(comentarios, favoritos, deseados, votosPositivos, votosNegativos) {
            this.comments = [];
            if (comentarios) {
                let comms = Object.values(comentarios);
                if (comms.length > 0) {
                    comms.forEach(comentario => this.comments = [...this.comments, comentario]);
                }
            };
            if (favoritos) {
                Object.entries(favoritos).forEach(entry => {
                    if (entry[1] == this.usuario.uid) {
                        this.favorite = true;
                    }
                });
            };
            if (deseados) {
                Object.entries(deseados).forEach(entry => {
                    if (entry[1] == this.usuario.uid) {
                        this.deseado = true;
                    }
                });
            };
            if (votosPositivos) {
                Object.entries(votosPositivos).forEach(entry => {
                    if (entry[1] == this.usuario.uid) {
                        this.like = true;
                    }
                });
            };
            if (votosNegativos) {
                Object.entries(votosNegativos).forEach(entry => {
                    if (entry[1] == this.usuario.uid) {
                        this.dislike = true;
                    }
                });
            };
        },
        meGusta: function (juego) {
            this.juegos.forEach(game => {
                if (game[1].votosNegativos) {
                    Object.entries(game[1].votosNegativos).forEach(entry => {
                        if (entry[1] == this.usuario.uid) {
                            firebase.database().ref(`Juegos/${juego}/votosNegativos/${entry[0]}`).remove();
                            this.dislike = false;
                            console.log("dislike destruido")
                        }
                    });
                };
            });
            if (this.like) {
                this.juegos.forEach(game => {
                    if (game[1].votosPositivos) {
                        Object.entries(game[1].votosPositivos).forEach(entry => {
                            if (entry[1] == this.usuario.uid) {
                                firebase.database().ref(`Juegos/${juego}/votosPositivos/${entry[0]}`).remove();
                                this.like = false;
                                console.log("like destruido")
                            }
                        });
                    };
                });
            }
            else {
                let newLikeKey = firebase.database().ref(`Juegos/${juego}/votosPositivos`).push().key;
                var update = {}
                update[`Juegos/${juego}/votosPositivos/${newLikeKey}`] = this.usuario.uid;
                firebase.database().ref().update(update);
                this.like = true;
            }
        },
        noMeGusta: function (juego) {
            this.juegos.forEach(game => {
                if (game[1].votosPositivos) {
                    Object.entries(game[1].votosPositivos).forEach(entry => {
                        if (entry[1] == this.usuario.uid) {
                            firebase.database().ref(`Juegos/${juego}/votosPositivos/${entry[0]}`).remove();
                            this.like = false;
                            console.log("like destruido")
                        }
                    });
                };
            });
            if (this.dislike) {
                this.juegos.forEach(game => {
                    if (game[1].votosNegativos) {
                        Object.entries(game[1].votosNegativos).forEach(entry => {
                            if (entry[1] == this.usuario.uid) {
                                firebase.database().ref(`Juegos/${juego}/votosNegativos/${entry[0]}`).remove();
                                this.dislike = false;
                                console.log("dislike destruido")
                            }
                        });
                    };
                });
            }
            else {
                let newDislikeKey = firebase.database().ref(`Juegos/${juego}/votosNegativos`).push().key;
                var update = {}
                update[`Juegos/${juego}/votosNegativos/${newDislikeKey}`] = this.usuario.uid;
                firebase.database().ref().update(update);
                this.dislike = true;
            }
        },
        returnBool: function (votosPositivos, votosNegativos) {
            let pos = 0;
            let neg = 0;
            if (votosPositivos) {
                pos = Object.values(votosPositivos).length;
            };
            if (votosNegativos) {
                neg = Object.values(votosNegativos).length;
            };
            return (pos > neg);
        },
        returnEqualBool: function (votosPositivos, votosNegativos) {
            let pos = 0;
            let neg = 0;
            if (votosPositivos) {
                pos = Object.values(votosPositivos).length;
            };
            if (votosNegativos) {
                neg = Object.values(votosNegativos).length;
            };
            return (pos == neg);
        },
        handleVotes: function (votosPositivos, votosNegativos) {
            let pos = 0;
            let neg = 0;
            if (votosPositivos) {
                pos = Object.values(votosPositivos).length;
            };
            if (votosNegativos) {
                neg = Object.values(votosNegativos).length;
            };
            if (pos > neg) {
                return pos / (pos + neg) * 100;
            }
            else {
                return neg / (pos + neg) * 100;
            }
        }
    },
    computed: {
        loadAllGames: function () {
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
        checkLogin: function () {
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
        },
        checkFavs: function () {
            if (this.juegos.length > 0) {
                this.juegos.forEach(juego => {
                    firebase.database().ref(`Juegos/${juego[0]}/favoritos`).on('child_added', (snapshot) => {
                        if (snapshot.val() == this.usuario.uid) {
                            if (!this.favoritos.includes(juego[0])) {
                                this.favoritos = [...this.favoritos, juego[0]]
                            }
                        }
                    })
                    firebase.database().ref(`Juegos/${juego[0]}/favoritos`).on('child_removed', (snapshot) => {
                        if (snapshot.val() == this.usuario.uid) {
                            // console.log("mismo usuario")
                            if (this.favoritos.includes(juego[0])) {
                                this.favoritos = this.favoritos.filter(game => game != juego[0]);
                            }
                        }
                    })
                })

            }
        },
        checkDes: function () {
            if (this.juegos.length > 0) {
                this.juegos.forEach(juego => {
                    firebase.database().ref(`Juegos/${juego[0]}/deseados`).on('child_added', (snapshot) => {
                        if (snapshot.val() == this.usuario.uid) {
                            if (!this.deseados.includes(juego[0])) {
                                this.deseados = [...this.deseados, juego[0]]
                            }
                        }
                    })
                    firebase.database().ref(`Juegos/${juego[0]}/deseados`).on('child_removed', (snapshot) => {
                        if (snapshot.val() == this.usuario.uid) {
                            // console.log("mismo usuario")
                            if (this.deseados.includes(juego[0])) {
                                this.deseados = this.deseados.filter(game => game != juego[0]);
                            }
                        }
                    })
                })

            }
        }
    }
}).mount('#app');