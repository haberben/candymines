import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import SlotGame from "./pages/SlotGame";
import GiftMarket from "./pages/GiftMarket";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import Referral from "./pages/Referral";
import MyGifts from "./pages/MyGifts";
import ProtectedRoute from "./components/ProtectedRoute";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"}>
        <ProtectedRoute>
          <SlotGame />
        </ProtectedRoute>
      </Route>
      <Route path={"/icons"} component={Home} />
      <Route path={"/market"}>
        <ProtectedRoute>
          <GiftMarket />
        </ProtectedRoute>
      </Route>
        <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/admin">
        <ProtectedRoute>
          <Admin />
        </ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      <Route path="/leaderboard" component={Leaderboard} />
       <Route path="/referral">
        <ProtectedRoute>
          <Referral />
        </ProtectedRoute>
      </Route>
      <Route path="/my-gifts">
        <ProtectedRoute>
          <MyGifts />
        </ProtectedRoute>
      </Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
