var id;

document.getElementById('listsList').replaceChildren(makeListsList());

select = makeListsList();
select.setAttribute('id', 'decklist-select')
console.log(select);
const newlist = document.createElement('option');
newlist.text = '+ NEW LIST +'
newlist.value = 'newList';
newlist.setAttribute('style', "text-shadow: 1px 0 1px black;");
select.appendChild(newlist);
document.getElementById('decklist-select-div').replaceChildren(select);

async function search() {
    const input = document.getElementById("search").value.toLowerCase().toString();
    if (input.length > 2) {
        const url = `http://localhost:3000/api/card/name/${input}`;
        console.log(url);
        const data = await fetch(url);
        const jsonData = await data.json();

        console.log(jsonData);

        makeUL(jsonData);
        document.getElementById("search-results").replaceChildren(makeUL(jsonData))

    } else {
        document.getElementById("search-results").replaceChildren();
    }
}

function makeUL(array) {
    var list = document.createElement('ul');
    list.setAttribute('class', 'search-results-list')

    for (var i = 0; i < array.length; i++) {

        list.appendChild(getCardNameDataLi(array[i]));
    }
    return list;
}

function getCardNameDataLi(card) {
    var item = document.createElement('li');
    var setIcon = item.appendChild(document.createElement('a'));
    setIcon.setAttribute('class', 'ss ss-' + card["setCode"].toLowerCase() + ' ss-' + card["rarity"]);
    item.appendChild(document.createTextNode(" "));
    item.appendChild(document.createTextNode(card["name"]));
    item.setAttribute('id', card["id"]);
    item.setAttribute('onClick', 'setCard(' + card["id"] + ')');
    return item;
}

async function setCard(cardId) {

    url = `http://localhost:3000/api/card/id/${cardId}`;
    const cardData = await fetch(url);
    const cardDataJson = await cardData.json();

    // set card image
    try {
        scryfallUrl = `https://api.scryfall.com/cards/${cardDataJson[0]["scryfallId"]}?format=image`
        const image = await fetch(scryfallUrl);
        const imageblob = await image.blob();
        const imageUrl = URL.createObjectURL(imageblob);
        document.getElementById("cardImage").setAttribute('src', imageUrl);
    } catch {
        document.getElementById("cardImage").setAttribute('src', 'Magic_card_back.png');
    }

    // set global id
    id = cardDataJson[0]["id"]

    // set header card name
    document.getElementById("header-name").innerHTML = cardDataJson[0]["name"];

    // set card info
    document.getElementById("card-name").innerHTML = "<b>Name: </b>" + cardDataJson[0]["name"];
    document.getElementById("card-manaCost").innerHTML = "<b>Mana cost: </b>" + cardDataJson[0]["manaCost"];
    document.getElementById("card-type").innerHTML = "<b>Type: </b>" + cardDataJson[0]["type"];
    document.getElementById("card-text").innerHTML = "<b>Text: </b>" + cardDataJson[0]["text"];
    document.getElementById("card-flavorText").innerHTML = "<b>flavorText: </b>" + cardDataJson[0]["flavorText"];
    document.getElementById("card-artist").innerHTML = "<b>Artist: </b>" + cardDataJson[0]["artist"];
    var purchaseUrls = JSON.parse(cardDataJson[0]["purchaseUrls"]);
    console.log(purchaseUrls);
    if (purchaseUrls.cardKingdom != null) {
        document.getElementById("card-url-cardKingdom").href = purchaseUrls.cardKingdom;
    } else document.getElementById("card-url-cardKingdom").href = "";
    if (purchaseUrls.cardmarket != null) {
        document.getElementById("card-url-cardmarket").href = purchaseUrls.cardmarket;
    } else document.getElementById("card-url-cardmarket").href = "";
    if (purchaseUrls.tcgplayer != null) {
        document.getElementById("card-url-tcgplayer").href = purchaseUrls.tcgplayer;
    } else document.getElementById("card-url-tcgplayer").href = null;
}

document.getElementById("decklist-select").onchange = changeListener;

function changeListener() {
    var value = this.value;

    if (value == "newList") {
        addDecklist();
    }
}


function addDecklist() {
    const name = prompt("name");
    if (name != null && name.length > 0) {
        newListUrl = `http://localhost:3000/api/list/put/${name}/-1`

        fetch(newListUrl).them(alert("A reload may be required to initialize the list")).catch(error => {
            console.error('Error:', error);
        });
    }
}

function addCardToList() {
    const list = document.getElementById('decklist-select').value;
    newListUrl = `http://localhost:3000/api/list/put/${list}/${id}`
    if (id != null) {
        fetch(newListUrl).catch(error => {
            console.error('Error:', error);
        }).then(window.location.reload(1));
    }

}

document.getElementById("decklist-select-list").onchange = searchDeckList;

function searchDeckList() {

    listUrl = `http://localhost:3000/api/list/`;
    cardUrl = `http://localhost:3000/api/card/id/`;

    const list = document.createElement('ul');

    console.log(this.value);

    fetch(listUrl + this.value).then(response => response.json()).then(data => {
        data.forEach(item => {
            fetch(cardUrl + item.cardId).then(res => res.json()).then(card => {
                if (card[0].cardId != -1) {
                    console.log(card);
                    list.append(getCardNameDataLi(card[0]));
                }
            });
        });
    }).catch(error => {
        console.error('Error:', error);
    });

    document.getElementById("search-results-list").replaceChildren(list);
}

function makeListsList() {
    const apiUrl = 'http://localhost:3000/api/list/';

    const selectElement = document.createElement('select');
    selectElement.setAttribute('class', 'decklist-select');
    selectElement.setAttribute('id', 'decklist-select-list');
    selectElement.setAttribute('name', 'decklist-select');

    const selectOption = document.createElement('option');
    selectOption.text = ('-- select an option --');
    selectOption.disabled = true;
    selectOption.selected = true;
    selectElement.appendChild(selectOption);


    fetch(apiUrl).then(response => response.json()).then(data => {
        data.forEach(item => {
            const optionElement = document.createElement('option');
            optionElement.value = item.list;
            optionElement.text = item.list;
            selectElement.appendChild(optionElement);
        });
    }).catch(error => {
        console.error('Error:', error);
    });

    return selectElement;
}