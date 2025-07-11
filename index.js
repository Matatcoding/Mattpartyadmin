const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2505-ftb-ct-web-pt"; // Make sure to change this!
const API = BASE + COHORT;

// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];

/** Updates state with all parties from the API */
async function getParties() {
  try {
    const response = await fetch(API + "/events");
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with a single party from the API */
async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all RSVPs from the API */
async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all guests from the API */
async function getGuests() {
  try {
    const response = await fetch(API + "/guests");
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

// === Components ===

/** Party name that shows more details about the party when clicked */
function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

/** A list of names of all parties */
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}

const deleteParty = async (id) => {
  try {
    const response = await fetch(API + "/events/" + id, {
      method: "DELETE",
    });

    await getParties();
    render();
  } catch (error) {
    console.error(error);
  }
};

const clickDelete = async () => {
  await deleteParty(selectedParty.id);
};
/** Detailed information about the selected party */
function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <GuestList></GuestList>
    <button class="deleter"> Delete Party</button>
  `;
  $party.querySelector("GuestList").replaceWith(GuestList());
  $party.querySelector(".deleter").addEventListener("click", clickDelete);

  return $party;
}

/** List of guests attending the selected party */
function GuestList() {
  const $ul = document.createElement("ul");
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id
    )
  );

  // Simple components can also be created anonymously:
  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });
  $ul.replaceChildren(...$guests);

  return $ul;
}

const addParty = async (e) => {
  e.preventDefault();
  console.log(e);
  console.log(e.target[0]);
  console.log(e.target[0].value);
  console.log(e.target[1].value);
  console.log(e.target[2].value);
  console.log(e.target[3].value);

  const givenDate = e.target[2].value;
  const isoDate = new Date(givenDate).toISOString();
  const obj = {
    name: e.target[0].value,
    description: e.target[1].value,
    date: isoDate,
    location: e.target[3].value,
  };

  try {
    const response = await fetch(API + "/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    });
    console.log(response);
    const data = await response.json();
    console.log(data);

    await getParties();
  } catch (error) {
    console.error(error);
  }
};

const setForm = () => {
  const $form = document.createElement("form");
  $form.innerHTML = `
      <div class="form-group">
        <label for="inputName">Name</label>
        <input
          type="text"
          class="form-control"
          id="exampleInputEmail1"
          placeholder="Enter name"
        />
      </div>
      <div class="form-group">
        <label for="inputDesc">Description</label>
        <input
          type="text"
          class="form-control"
          id="exampleInputPassword1"
          placeholder="Enter Description"
        />
      </div>
      <div class="form-group">
        <label for="inputDate">Date</label>
        <input
          type="date"
          class="form-control"
          id="inputDate"
          placeholder="mm/dd/yyyy"
        />
      </div>
      <div class="form-group">
        <label for="inputLoc">Location</label>
        <input
          type="text"
          class="form-control"
          placeholder="Location"
        />
      </div>

      <button type="submit" class="addParty">Add Party</button>
    `;
  $form.style.width = "75%";
  $form.style.margin = "0 auto";
  $form.addEventListener("submit", addParty);

  return $form;
};

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
    </main>
  `;

  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
  $app.append(setForm());
}

async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}

init();
