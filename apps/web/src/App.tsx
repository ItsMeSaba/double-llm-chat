import { ProtectedRoute } from "./components/ProtectedRoute";
import { Routes, Route, Navigate } from "react-router-dom";
import { routes } from "./routes";
import "./App.scss";

function App() {
  return (
    <div className="App">
      <Routes>
        {routes.map(({ path, element, protected: isProtected }) => (
          <Route
            key={path}
            path={path}
            element={
              isProtected ? <ProtectedRoute>{element}</ProtectedRoute> : element
            }
          />
        ))}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
