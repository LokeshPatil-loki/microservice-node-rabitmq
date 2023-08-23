import "./App.css";
import Products from "./admin/Products";
import Menu from "./components/Menu";
import Nav from "./components/Nav";
import { BrowserRouter, Route, Routes } from "react-router-dom";
function App() {
  return (
    <>
    <Nav/>

      <div className="container-fluid">
        <div className="row">
        <Menu/>

          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">

          <BrowserRouter>
            <Routes>
            <Route path="/admin/product" Component={Products} />
            </Routes>
          </BrowserRouter>
          </main>
        </div>
      </div>
    </>
  )
}

export default App
