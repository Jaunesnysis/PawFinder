import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import QuestionnairePage from "./pages/QuestionnairePage";
import AnimalListPage from "./pages/AnimalListPage/AnimalListPage.jsx";
import MainAnimalsPage from "./pages/MainAnimalsPage";
import ShelterProfilePage from "./pages/ShelterPage/ShelterProfilePage.jsx";
import ShelterListPage from "./pages/ShelterPage/ShelterListPage.jsx";
import FavoritesPage from "./pages/FavoritesPage.jsx";
import "./App.css";
import AchievementsPage from "./pages/AchievementsPage/AchievementsPage.jsx";
import NotificationsPage from "./pages/NotificationsPage/NotificationsPage.jsx";
import LoginPage from "./pages/LoginPage/LoginPage";
import WelcomePage from "./pages/GuestPages/WelcomePage/WelcomePage.jsx";
import Navbar from "./components/Navbar/Navbar";
import RegistrationPage from "./pages/RegistrationPage/RegistrationPage.jsx";
import PetDetailsPage from "./pages/PetDetailsPage/PetDetailsPage";
import LeaderboardPage from "./pages/LeaderboardPage/LeaderboardPage.jsx";
import MyReservationsPage from "./pages/MyReservationsPage.jsx";
import RegistrationPageShelter from "./pages/RegistrationPage/RegistrationPageShelter";
import ShelterPetsListPage from "./pages/ShelterPage/ShelterPetsListPage.jsx";
import NewPetPage from "./pages/PetFormPage/NewPetPage.jsx";
import EditPetPage from "./pages/PetFormPage/EditPetPage.jsx";
import ShelterReservationsPage from "./pages/ShelterPage/ShelterReservationsPage.jsx";
import StatisticsPage from "./pages/StatisticsPage/StatisticsPage.jsx";
import UserEditPage from "./pages/ProfileEditPage/UserEditPage.jsx";
import ShelterEditPage from "./pages/ProfileEditPage/ShelterEditPage.jsx";

function App() {
  return (
    <div className="app-main-container">
      {/* Navbar pats nusprendžia ar ir ką rodyti */}
      <Navbar />S

      {/* Pagrindinis turinys */}
      <main style={{ padding: "0 20px" }}>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/questionnaire" element={<QuestionnairePage />} />
          <Route path="/animals" element={<AnimalListPage />} />
          <Route path="/mainAnimals" element={<MainAnimalsPage />} />
          <Route path="/shelters" element={<ShelterListPage />} />
          <Route path="/shelters/:shelterId" element={<ShelterProfilePage />} />
          <Route
            path="/shelterReservations"
            element={<ShelterReservationsPage />}
          />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/favorites/:userid" element={<FavoritesPage />} />
          <Route path="/pets/:id" element={<PetDetailsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route
            path="/myReservationsPage"
            element={<MyReservationsPage />}
          ></Route>
          <Route
            path="/register-shelter"
            element={<RegistrationPageShelter />}
          />
          <Route path="/mySheltersPets" element={<ShelterPetsListPage />} />
          <Route path="/addNewPet" element={<NewPetPage />} />
          <Route path="/editPet/:id" element={<EditPetPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/editProfile" element={<UserEditPage />} />
          <Route path="/shelterProfile" element={<ShelterEditPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
