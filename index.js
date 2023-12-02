const fs = require("fs");

const API_URL = "https://icanhazdadjoke.com/search";

const fetchJokes = async (searchTerm) => {
  try {
    const response = await fetch(`${API_URL}?term=${searchTerm}`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch jokes. HTTP status: ${response.status}`);
    }

    const jokes = await response.json();
    return jokes.results;
  } catch (error) {
    throw new Error(`Error fetching jokes: ${error.message}`);
  }
};

const selectRandomJoke = (jokes) => {
  if (jokes.length > 0) {
    const randomIndex = Math.floor(Math.random() * jokes.length);
    return jokes[randomIndex];
  } else {
    return null;
  }
};

const saveJokeToFile = (joke, jokes, liked) => {
  const existingJokeIndex = jokes.findIndex(
    (existing) => existing.joke === joke.joke
  );

  if (existingJokeIndex !== -1) {
    jokes[existingJokeIndex].likes =
      (jokes[existingJokeIndex].likes || 0) + (liked ? 1 : 0);
  } else {
    const newJoke = { joke: joke.joke, likes: liked ? 1 : 0 };
    jokes.push(newJoke);
  }

  fs.writeFileSync("jokes.txt", JSON.stringify(jokes, null, 2), "utf8");
};

const displayWittyMessage = () => {
  console.log("the joke gods are taking a day off.");
};

const askForLike = () => {
  return new Promise((resolve) => {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.question("Did you like the joke? (yes/no): ", (response) => {
      resolve(response);
      readline.close();
    });
  });
};

const displayLeaderboard = (jokes) => {
  console.log("Displaying leaderboard...");

  const sortedJokes = jokes.sort((a, b) => (b.likes || 0) - (a.likes || 0));

  sortedJokes.forEach((joke, index) => {
    console.log(`${index + 1}. Joke: ${joke.joke}, Likes: ${joke.likes || 0}`);
  });
};

const main = async () => {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(
    );
    return;
  }

  const command = args[0];

  let jokes = [];

  try {
    const jokesData = fs.readFileSync("jokes.txt", "utf8");
    jokes = JSON.parse(jokesData);
  } catch (error) {
    console.error("Error reading jokes file:", error.message);
  }

  if (command === "--search" && args.length > 1) {
    const searchTerm = args.slice(1).join(" ");
    try {
      const jokesFromAPI = await fetchJokes(searchTerm);
      const selectedJoke = selectRandomJoke(jokesFromAPI);

      if (selectedJoke) {
        console.log(`Here's a joke for you: ${selectedJoke.joke}`);

        const likeResponse = await askForLike();

        saveJokeToFile(
          selectedJoke,
          jokes,
          likeResponse.toLowerCase() === "yes"
        );

        if (likeResponse.toLowerCase() === "yes") {
          console.log(
            "Thanks for liking the joke! It has been added to the leaderboard."
          );
        } else {
          console.log("No worries, maybe next time!");
        }
      } else {
        displayWittyMessage();
      }
    } catch (error) {
      console.error(error.message);
    }
  } else if (command === "--leaderboard") {
    displayLeaderboard(jokes);
  } else {
    console.log(
      "Invalid command : Please provide a search term using --search or use the --leaderboard option."
    );
  }
};

main();
