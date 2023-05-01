const express = require("express");
const app = express();
app.use(express.json());
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const intializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`error message:${e.message}`);
    process.exit(1);
  }
};

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

intializeDbAndServer();

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) => {
      convertDbObjectToResponseObject(eachPlayer);
    })
  );
});

app.get("/players/:playerId/", async (request, resposne) => {
  const { playerId } = request.params;
  const getPlayer = `SELECT * FORM cricket_team WHERE player_id = ${playerId}`;
  const player = await db.get(getPlayer);
  response.send(convertDbObjectToResponseObject(player));
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO
      cricket_team (playerName,jerseyNumber,role)
    VALUES
      (
        '${playerName}',
         ${jerseyNumber},
         ${role},

      );`;

  const dbresponse = await db.run(addPlayerQuery);
  response.send("player Added to the team");
});

app.put(`/players/:playerId/`, async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updateTeam = `UPDATE cricket_team SET playerName =${playerName},jerseyNumber = ${jerseyNumber},role=${role}
    WHERE playerId = ${playerId};`;
  await db.run(updateTeam);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM
      cricket_team
    WHERE
      playerId = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("player removed Successfully");
});

module.exports = app;
