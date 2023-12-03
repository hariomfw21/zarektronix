// Joke CLI Tool with Leaderboard Feature

const fs = require("fs");

// API URL for fetching jokes
const API_URL = "https://icanhazdadjoke.com/search";


//  Fetch jokes from the 'icanhazdadjoke' API based on the provided search term.

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


//   Select a random joke from the provided array of jokes.

const selectRandomJoke = (jokes) => {
  if (jokes.length > 0) {
    const randomIndex = Math.floor(Math.random() * jokes.length);
    return jokes[randomIndex];
  } else {
    return null;
  }
};


//  Save a joke to the 'jokes.txt' file, updating likes if the joke already exists.

const saveJokeToFile = (joke, jokes, liked) => {
  const existingJokeIndex = jokes.findIndex(
    (existing) => existing.joke === joke.joke
  );

  if (existingJokeIndex !== -1) {
    // Update likes for the existing joke
    jokes[existingJokeIndex].likes =
      (jokes[existingJokeIndex].likes || 0) + (liked ? 1 : 0);
  } else {
    // Add a new joke with 0 likes
    jokes.push({ joke: joke.joke, likes: liked ? 1 : 0 });
  }

  // Save the updated jokes array to 'jokes.txt'
  fs.writeFileSync("jokes.txt", JSON.stringify(jokes, null, 2), "utf8");
};


//  Display a witty message when no jokes are available. 

const displayWittyMessage = () => {
  console.log("the joke gods are taking a day off.");
};

//  Prompt the user to indicate whether they liked the displayed joke.
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


//  Display the leaderboard with the most liked jokes.

const displayLeaderboard = (jokes) => {
  console.log("Displaying leaderboard...");

  // Sort jokes based on likes in descending order
  const sortedJokes = jokes.sort((a, b) => (b.likes || 0) - (a.likes || 0));

  // Display the sorted jokes with their respective likes
  sortedJokes.forEach((joke, index) => {
    console.log(`${index + 1}. Joke: ${joke.joke}, Likes: ${joke.likes || 0}`);
  });
};

/**
 * Main function to handle user commands and execute the appropriate actions.
 */
const main = async () => {
  // Retrieve command line arguments
  const args = process.argv.slice(2);

  // Check if any command line arguments are provided
  if (args.length === 0) {
    console.log("Invalid command: Please provide a search term using --search or use the --leaderboard option.");
    return;
  }

  // Extract the command from the arguments
  const command = args[0];

  // Initialize an array to store jokes
  let jokes = [];

  // Try to read existing jokes from 'jokes.txt'
  try {
    const jokesData = fs.readFileSync("jokes.txt", "utf8");
    jokes = JSON.parse(jokesData);
  } catch (error) {
    console.error("Error reading jokes file:", error.message);
  }

  // Handle different commands
  if (command === "--search" && args.length > 1) {
    // Search for jokes based on the provided search term
    const searchTerm = args.slice(1).join(" ");
    try {
      const jokesFromAPI = await fetchJokes(searchTerm);
      const selectedJoke = selectRandomJoke(jokesFromAPI);

      if (selectedJoke) {
        // Display the selected joke
        console.log(`Here's a joke for you: ${selectedJoke.joke}`);

        // Ask the user if they liked the joke
        const likeResponse = await askForLike();

        // Save the joke to 'jokes.txt' and update likes based on user response
        saveJokeToFile(selectedJoke, jokes, likeResponse.toLowerCase() === "yes");

        if (likeResponse.toLowerCase() === "yes") {
          console.log("Thanks for liking the joke! It has been added to the leaderboard.");
        } else {
          console.log("No worries, maybe next time!");
        }
      } else {
        // Display a witty message if no jokes are available
        displayWittyMessage();
      }
    } catch (error) {
      console.error(error.message);
    }
  } else if (command === "--leaderboard") {
    // Display the leaderboard based on the stored jokes
    displayLeaderboard(jokes);
  } else {
    // Display an error message for invalid commands
    console.log("Invalid command: Please provide a search term using --search or use the --leaderboard option.");
  }
};

// Execute the main function
main();
