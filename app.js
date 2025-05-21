const { createApp, ref, computed } = Vue;
createApp({
    setup() {
        let characters = ref([]);
        let currentUser = ref(null);
        let selectedCharacter = ref(null);
        let loginData = ref({ username: '', password: '' });
        let registerData = ref({
            username: '',
            password: '',
            lastName: '',
            firstName: '',
            middleName: '',
            phone: '',
            gender: '',
            age: null,
            favoriteHouses: []
        });
        let registerErrors = ref({});
        let houses = ref(['Gryffindor', 'Slytherin', 'Ravenclaw', 'Hufflepuff']);
        let favorites = ref([]);
        let isLoading = ref(true);
        let searchQuery = ref('');
        let sortField = ref('name');
        let hogwartsFilter = ref('all');
        let hairColourFilter = ref('all');


        fetch('https://hp-api.onrender.com/api/characters')
            .then(response => response.json())
            .then(data => {
                characters.value = data;
                isLoading.value = false;
            })
        let filteredCharacters = computed(() => {
            let result = [...characters.value];
            if (searchQuery.value) {
                const query = searchQuery.value.toLowerCase();
                result = result.filter(character => 
                    character.name.toLowerCase().includes(query) ||
                    (character.house && character.house.toLowerCase().includes(query)) ||
                    (character.species && character.species.toLowerCase().includes(query))
                );
            }
            if (hogwartsFilter.value !== 'all') {
                result = result.filter(character => {
                    if (hogwartsFilter.value === 'student') return character.hogwartsStudent;
                    if (hogwartsFilter.value === 'staff') return character.hogwartsStaff;
                    if (hogwartsFilter.value === 'other') return !character.hogwartsStudent && !character.hogwartsStaff;
                    return true;
                });
            }
            if (hairColourFilter.value !== 'all') {
                result = result.filter(character => {
                    if (!character.hairColour) return hairColourFilter.value === 'unknown';
                    
                    const hairColor = character.hairColour.toLowerCase();
                    switch(hairColourFilter.value) {
                        case 'black': return hairColor.includes('black');
                        case 'brown': return hairColor.includes('brown');
                        case 'blonde': return hairColor.includes('blonde') || hairColor.includes('blond');
                        case 'red': return hairColor.includes('red') || hairColor.includes('ginger');
                        case 'white': return hairColor.includes('white');
                        case 'grey': return hairColor.includes('grey') || hairColor.includes('gray');
                        case 'unknown': return !character.hairColour;
                        default: return true;
                    }
                });
            }
            

            if (sortField.value) {
                const [field, direction] = sortField.value.includes('_desc') 
                    ? [sortField.value.replace('_desc', ''), 'desc'] 
                    : [sortField.value, 'asc'];
                
                result.sort((a, b) => {
                    if (field === 'gender') {
                        const genderA = getGenderName(a.gender) === 'Мужской' ? 0 : 1;
                        const genderB = getGenderName(b.gender) === 'Мужской' ? 0 : 1;
                        return direction === 'asc' ? genderA - genderB : genderB - genderA;
                    }
                    if (field === 'yearOfBirth') {
                        const valA = a.yearOfBirth || 0;
                        const valB = b.yearOfBirth || 0;
                        return direction === 'asc' ? valA - valB : valB - valA;
                    }
                    let valA = a[field];
                    let valB = b[field];
                    
                    if (typeof valA === 'string') valA = valA.toLowerCase();
                    if (typeof valB === 'string') valB = valB.toLowerCase();
                    
                    if (valA < valB) return direction === 'asc' ? -1 : 1;
                    if (valA > valB) return direction === 'asc' ? 1 : -1;
                    return 0;
                });
            }
            
            return result;
        });
        let resetFilters = () => {
            searchQuery.value = '';
            sortField.value = 'name';
            hogwartsFilter.value = 'all';
            hairColourFilter.value = 'all';
        };
        let getHouseName = (house) => {
            let housesMap = {
                'Gryffindor': 'Gryffindor',
                'Slytherin': 'Slytherin',
                'Ravenclaw': 'Ravenclaw',
                'Hufflepuff': 'Hufflepuff'
            };
            return housesMap[house] || house;
        };

        let getGenderName = (gender) => {
            let genderMap = {
                'male': 'Мужской',
                'female': 'Женский'
            };
            return genderMap[gender] || gender;
        };

        let getAncestryName = (ancestry) => {
            let ancestryMap = {
                'pure-blood': 'Чистокровный',
                'half-blood': 'Полукровка',
                'muggleborn': 'Магглорождённый',
                'squib': 'Сквиб',
                '': 'Неизвестно'
            };
            return ancestryMap[ancestry] || ancestry;
        };
        let openCharacterModal = (character) => {
            selectedCharacter.value = character;
            document.getElementById('characterModal').style.display = 'block';
        };

        let showLoginModal = () => {
            document.getElementById('loginModal').style.display = 'block';
        };

        let showRegisterModal = () => {
            document.getElementById('registerModal').style.display = 'block';
        };

        let closeModal = () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        };
        let login = () => {
            currentUser.value = {
                username: loginData.value.username,
                firstName: 'Пользователь'
            };
            closeModal();
        };

        let logout = () => {
            currentUser.value = null;
            favorites.value = [];
        };

        let register = () => {
            currentUser.value = {
                username: registerData.value.username,
                firstName: registerData.value.firstName
            };
            closeModal();
        };
        let toggleFavorite = (character) => {
            let index = favorites.value.findIndex(fav => fav.id === character.id);
            if (index === -1) {
                favorites.value.push(character);
            } else {
                favorites.value.splice(index, 1);
            }
        };
        let isFavorite = (character) => {
            return favorites.value.some(fav => fav.id === character.id);
        };
        return {
            characters,
            currentUser,
            selectedCharacter,
            loginData,
            registerData,
            registerErrors,
            houses,
            searchQuery,
            sortField,
            hogwartsFilter,
            hairColourFilter,
            filteredCharacters,
            isLoading,
            resetFilters,
            getHouseName,
            getGenderName,
            getAncestryName,
            openCharacterModal,
            showLoginModal,
            showRegisterModal,
            closeModal,
            login,
            logout,
            register,
            toggleFavorite,
            isFavorite
        };
    }
}).mount('#app');