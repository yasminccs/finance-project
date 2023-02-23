function createTransactionContainer(id) {
  const container = document.createElement("div");
  container.classList.add("transaction");
  container.id = `transaction-${id}`;
  return container;
}

function createTransactionTitle(name) {
  const title = document.createElement("span");
  title.classList.add("transaction-title");
  title.textContent = name;
  return title;
}

function createTransactionAmount(amount) {
  const span = document.createElement("span");
  span.classList.add("transaction-amount");
  const formater = Intl.NumberFormat("pt-BR", {
    compactDisplay: "long",
    currency: "BRL",
    style: "currency",
  }).format(amount);

  span.textContent = formater;
  if (amount > 0) {
    span.classList.add("transaction-amount", "credit");
  } else {
    span.classList.add("transaction-amount", "debit");
  }
  return span;
}

function renderTransaction(transaction) {
  const container = createTransactionContainer(transaction.id);
  const title = createTransactionTitle(transaction.name);
  const amount = createTransactionAmount(transaction.amount);
  const editBtn = createEditTransactionBtn(transaction);
  const deleteBtn = createDeleteTransactionButton(transaction.id);

  const divSpans = document.createElement("div");
  divSpans.classList.add("spans");

  const divBtns = document.createElement("div");
  divBtns.classList.add("btns");

  document.querySelector("#transactions").append(container);
  divSpans.append(title, amount);
  divBtns.append(editBtn, deleteBtn);
  container.append(divSpans, divBtns);
}

async function fetchTransactions() {
  return await fetch("http://localhost:3000/transactions").then((res) => res.json());
}

async function fetchTransactions(){
  try{
    const response = await fetch("http://localhost:3000/transactions")
    if(!response.ok){
      throw new Error("Error fetching transactions")
    }
    return await response.json()
  } catch (error) {
    console.log(error)
  }
}

const transactions = [];

document.addEventListener("DOMContentLoaded", async function setup() { 
  try {
    const results = await fetchTransactions();
    transactions.push(...results);
    transactions.forEach(renderTransaction);
    updateBalance();
  } catch (error) {
    console.log(error)
  }
});

function updateBalance() {
  const balanceSpan = document.querySelector("#balance");
  const balance = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const formater = Intl.NumberFormat("pt-BR", {
    compactDisplay: "long",
    currency: "BRL",
    style: "currency",
  });
  balanceSpan.textContent = formater.format(balance);
}

document.querySelector("#typeTrans").addEventListener("click", ev => {
  const target = ev.target;
  const amountValue = document.querySelector("#amount").value;
  const amount = document.querySelector("#amount");
  if (target.id === "credit") {
    amount.value = amountValue * -1;
  } else if (target.id === "debit") {
    amount.value = amountValue * -1;
  }
});

async function saveTransaction(ev) {
  const id = document.querySelector("#id").value;
  const name = document.querySelector("#name").value;
  const amount = Number(document.querySelector("#amount").value);

  try {
    let response;
    let transaction;

    if (id) {
      response = await fetch(`http://localhost:3000/transactions/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name, amount }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error updating transaction");
      }

      transaction = await response.json();

      const indexToRemove = transactions.findIndex(t => t.id === id);
      transactions.splice(indexToRemove, 1, transaction);
      document.querySelector(`#transaction-${id}`).remove();
      renderTransaction(transaction);
    } else {
      ev.preventDefault();
      response = await fetch("http://localhost:3000/transactions", {
        method: "POST",
        body: JSON.stringify({ name, amount }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error creating transaction");
      }

      transaction = await response.json();
      transactions.push(transaction);
      renderTransaction(transaction);
      ev.target.reset();
    }
    
    updateBalance();
  } catch (error) {
    console.log(error);
  }
}
document.querySelector("form").addEventListener("submit", saveTransaction);

function createEditTransactionBtn(transaction) {
  const editBtn = document.createElement("button");
  editBtn.classList.add("edit-btn");
  editBtn.textContent = "Editar";
  editBtn.addEventListener("click", () => {
    document.querySelector("#id").value = transaction.id;
    document.querySelector("#name").value = transaction.name;
    document.querySelector("#amount").value = transaction.amount;
  });
  return editBtn;
}

function createDeleteTransactionButton(id) {
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Excluir";
  deleteBtn.classList.add("delete-btn");

  deleteBtn.addEventListener("click", () => {
    const section = document.createElement('section')
    section.classList.add('msgBoxDelete')

    const messageBox = document.createElement("div");
    messageBox.classList.add("message-box");

    const message = document.createElement("h1");
    message.textContent = "Você deseja excluir?";
    message.classList.add("titleBox");

    const yesBtn = document.createElement("button");
    yesBtn.textContent = "Sim";
    yesBtn.classList.add("yes-btn");

    yesBtn.addEventListener("click", async () => {
      await fetch(`http://localhost:3000/transactions/${id}`, {
        method: "DELETE"
      });
      const indexToRemove = transactions.findIndex(t => t.id === id);
      transactions.splice(indexToRemove, 1);
      document.querySelector(`#transaction-${id}`).remove();
      updateBalance();
      section.remove();
    });

    const noBtn = document.createElement("button");
    noBtn.textContent = "Não";
    noBtn.classList.add("no-btn");

    noBtn.addEventListener("click", () => {
      section.remove();
    });

    const divBtns = document.createElement('div')
    
    divBtns.append(yesBtn, noBtn)
    messageBox.append(message, divBtns);
    section.appendChild(messageBox)
    document.body.appendChild(section);
  });

  return deleteBtn;
}

const body = document.querySelector("body");
const root = document.querySelector(":root");
document.getElementById("switchTheme").addEventListener("click", function () {
  if (body.dataset.theme === "dark") {
    root.style.setProperty("--bg-color", "#e0dede");
    root.style.setProperty("--bg-input", "#c8bfce");
    root.style.setProperty("--font-color", "#161516");
    root.style.setProperty("--bg-button", "#158c39");
    body.dataset.theme = "light";
  } else {
    root.style.setProperty("--bg-color", "#161516");
    root.style.setProperty("--bg-input", "#39353b");
    root.style.setProperty("--font-color", "#fff");
    root.style.setProperty("--bg-button", "#6bf394");
    body.dataset.theme = "dark";
  }
});