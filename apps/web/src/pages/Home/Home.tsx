import { Box } from "@chakra-ui/react";
import "./Home.css";

const Home = () => {
  return (
    <>
      <Box textAlign="center" className="box-container">
        <div className="left">
          <div className="container top-left">
            <h1>Game rules</h1>
            <ul>
              <li>
                Default Retirement Age increases every time someone retires.
              </li>
              <li>People that get to the age compete for the slot.</li>
              <li>
                The slot goes to the one that got the most money in out of the
                applicants.
              </li>
              <li>The ones that don’t get the slot have to start over.</li>
              <li>The more people you bring in, the more money you make.</li>
              <li>
                The more money you contribute, the earlier you can retire.
              </li>
            </ul>
          </div>
        </div>
        <div className="right">
          <div className="container top-rigt">
            <h1>Player stuatus</h1>
            <h2>Retirement age: 65</h2>
            <h2>Your age: 20</h2>
            <h2>Your contributions: $120,000</h2>
            <h2>People brought in: 10</h2>
          </div>
          <div className="container bottom-right">
            <h1>Actions</h1>
            <button>Contribute more</button>
            <button>Invite</button>
          </div>
        </div>
      </Box>
    </>
  );
};

export default Home;
