import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import Modal from "react-modal";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import Header from "../../partials/Header";
import Footer from "../../partials/Footer";
import SidePanel from "../../partials/SidePanel";
import "./css/Budget.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

Modal.setAppElement("#root");

const Expenses = () => {
  const { projectid } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    total_expenses: 0,
    remaining_budget: 0,
  });
  const [plannedBudget, setPlannedBudget] = useState(null);
  const [newPlannedBudget, setNewPlannedBudget] = useState("");
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "Other",
  });
  const [filterCategory, setFilterCategory] = useState("");
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isUpdateBudgetModalOpen, setIsUpdateBudgetModalOpen] = useState(false);
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    fetchBudget();
    fetchExpenses();
  }, [filterCategory]);

  const fetchBudget = () => {
    axios
      .get(`http://localhost:8000/api/v1/project/${projectid}/budget/`, {
        headers: { Authorization: `Bearer ${Cookies.get("access_token")}` },
      })
      .then((response) => {
        setPlannedBudget(response.data.total_budget);
        setSummary({
          total_expenses: response.data.total_expenses,
          remaining_budget: response.data.remaining_budget,
        });
      })
      .catch((error) => console.error("Error fetching budget:", error));
  };

  const fetchExpenses = (
    url = `http://localhost:8000/api/v1/project/${projectid}/expenses/`
  ) => {
    if (filterCategory) {
      url += `?category=${filterCategory}`;
    }
    axios
      .get(url, {
        headers: { Authorization: `Bearer ${Cookies.get("access_token")}` },
      })
      .then((response) => {
        setExpenses(response.data.results);
        setNextPage(response.data.next);
        setPrevPage(response.data.previous);
      })
      .catch((error) => console.error("Error fetching expenses:", error));
  };

  const handleAddExpense = () => {
    axios
      .post(
        `http://localhost:8000/api/v1/project/${projectid}/expenses/`,
        newExpense,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        fetchExpenses();
        setNewExpense({ description: "", amount: "", category: "Other" });
        setIsAddExpenseModalOpen(false);
      })
      .catch((error) => console.error("Error adding expense:", error));
  };

  const handleUpdateBudget = () => {
    axios
      .put(
        `http://localhost:8000/api/v1/project/${projectid}/budget/`,
        { total_budget: newPlannedBudget },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        fetchBudget();
        setNewPlannedBudget("");
        setIsUpdateBudgetModalOpen(false);
      })
      .catch((error) => console.error("Error updating budget:", error));
  };

  const handleDeleteExpense = (expenseId) => {
    axios
      .delete(
        `http://localhost:8000/api/v1/project/${projectid}/expenses/${expenseId}/`,
        {
          headers: { Authorization: `Bearer ${Cookies.get("access_token")}` },
        }
      )
      .then(() => {
        setExpenses((prevExpenses) =>
          prevExpenses.filter((expense) => expense.id !== expenseId)
        );
      })
      .catch((error) => console.error("Error deleting expense:", error));
  };

  const categoryData = expenses.reduce((acc, expense) => {
    acc[expense.category] =
      (acc[expense.category] || 0) + parseFloat(expense.amount);
    return acc;
  }, {});

  const doughnutData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        label: "Expenses by Category",
        data: Object.values(categoryData),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  const barData = {
    labels: ["Planned Budget", "Total Expenses", "Remaining Budget"],
    datasets: [
      {
        label: "Budget Overview",
        data: [plannedBudget, summary.total_expenses, summary.remaining_budget],
        backgroundColor: ["#36A2EB", "#FF6384", "#4BC0C0"],
      },
    ],
  };

  return (
    <div className="app-container">
      <Header />
      <div className="content-container">
        <SidePanel />
        <div className="main-content expenses-container">
          <h2 className="expenses-header">Budget</h2>

          {/* Sekcja podsumowania budżetu */}
          <div className="budget-summary">
            <p>
              <strong>Total Budget:</strong> {plannedBudget} PLN
            </p>
            <p>
              <strong>Total Expenses:</strong> {summary.total_expenses} PLN
            </p>
            <p>
              <strong>Remaining Budget:</strong> {summary.remaining_budget} PLN
            </p>
            <button onClick={() => setIsUpdateBudgetModalOpen(true)}>
              Update Budget
            </button>
            <button onClick={() => setIsAddExpenseModalOpen(true)}>
              Add Expense
            </button>
          </div>

          {/* Przycisk pokazujący wykresy */}
          <button
            className="add-event-button"
            onClick={() => setShowCharts(!showCharts)}
          >
            {showCharts ? "Hide Charts" : "Show Charts"}
          </button>

          {/* Sekcja wykresów */}
          {showCharts && (
            <>
              <div className="chart-container">
                <h3>Budget Overview</h3>
                <Bar data={barData} />
              </div>
              <div className="chart-container">
                <h3>Expenses by Category</h3>
                <Doughnut data={doughnutData} />
              </div>
            </>
          )}

          {/* Sekcja wydatków */}
          <h3>Expenses</h3>
          <div>
            <label htmlFor="filter-category">Filter by Category:</label>
            <select
              id="filter-category"
              onChange={(e) => setFilterCategory(e.target.value)}
              value={filterCategory}
            >
              <option value="">All Categories</option>
              <option value="Equipment">Equipment</option>
              <option value="Transport">Transport</option>
              <option value="Labor">Labor</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <ul className="expenses-list">
            {expenses.map((expense) => (
              <li key={expense.id}>
                <div>
                  <strong>{expense.description}</strong>: {expense.amount} PLN (
                  {expense.category})
                </div>
                <button onClick={() => handleDeleteExpense(expense.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>

          {/* Przycisk obsługi paginacji */}
          <div className="pagination-buttons">
            {prevPage && (
              <button onClick={() => fetchExpenses(prevPage)}>Previous</button>
            )}
            {nextPage && (
              <button onClick={() => fetchExpenses(nextPage)}>Next</button>
            )}
          </div>

          {/* Modal: Dodawanie wydatku */}
          <Modal
            isOpen={isAddExpenseModalOpen}
            onRequestClose={() => setIsAddExpenseModalOpen(false)}
            contentLabel="Add Expense Modal"
            className="modal-content"
            overlayClassName="modal-overlay"
          >
            <h2>Add Expense</h2>
            <input
              type="text"
              placeholder="Description"
              value={newExpense.description}
              onChange={(e) =>
                setNewExpense({ ...newExpense, description: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Amount"
              value={newExpense.amount}
              onChange={(e) =>
                setNewExpense({ ...newExpense, amount: e.target.value })
              }
            />
            <select
              onChange={(e) =>
                setNewExpense({ ...newExpense, category: e.target.value })
              }
              value={newExpense.category}
            >
              <option value="Equipment">Equipment</option>
              <option value="Transport">Transport</option>
              <option value="Labor">Labor</option>
              <option value="Other">Other</option>
            </select>
            <button onClick={handleAddExpense}>Add</button>
            <button onClick={() => setIsAddExpenseModalOpen(false)}>
              Cancel
            </button>
          </Modal>

          {/* Modal: Aktualizacja budżetu */}
          <Modal
            isOpen={isUpdateBudgetModalOpen}
            onRequestClose={() => setIsUpdateBudgetModalOpen(false)}
            contentLabel="Update Budget Modal"
            className="modal-content"
            overlayClassName="modal-overlay"
          >
            <h2>Update Planned Budget</h2>
            <input
              type="number"
              placeholder="New Planned Budget"
              value={newPlannedBudget}
              onChange={(e) => setNewPlannedBudget(e.target.value)}
            />
            <button onClick={handleUpdateBudget}>Update</button>
            <button onClick={() => setIsUpdateBudgetModalOpen(false)}>
              Cancel
            </button>
          </Modal>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Expenses;
