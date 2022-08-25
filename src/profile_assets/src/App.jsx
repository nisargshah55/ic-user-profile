import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import CreateProfile from './components/CreateProfile';
import ListProfiles from './components/ListProfiles';
import NavigationBar from './NavigationBar';

const App = () => {

  return (
    <div>

      <BrowserRouter>
        <NavigationBar />
        <div className="container">
          <Switch>
            <Route path="/" exact component={ListProfiles}></Route>
            <Route path="/profiles" component={ListProfiles}></Route>
            <Route path="/add" component={CreateProfile}></Route>
            <Route path="/edit/:id" component={CreateProfile}></Route>
          </Switch>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
