import {
  Box,
  Button,
  Link,
  Image,
  Text,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import {
  useWriteContract,
  useReadContract,
  useBlockNumber,
  useSimulateContract,
} from "wagmi";
import { parseAbi } from "viem";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import "./App.css";

function App() {
  const queryClient = useQueryClient();

  const { data: blockNumber } = useBlockNumber({ watch: true });
  const {
    data: count,
    isError,
    isLoading,
    queryKey,
  } = useReadContract({
    address: "0x5fbdb2315678afecb367f032d93f642f64180aa3",
    functionName: "number",
    abi: parseAbi(["function number() public view returns (uint256)"]),
  });

  const { data } = useSimulateContract({
    address: "0x5fbdb2315678afecb367f032d93f642f64180aa3",
    functionName: "increment",
    abi: parseAbi(["function increment() public"]),
  });

  const { writeContract } = useWriteContract();
  const shadowColor = useColorModeValue("#646cffaa", "#61dafbaa");
  const textColor = useColorModeValue("#888", "#ddd");

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [blockNumber, queryClient]);

  return (
    <>
      <Flex
        justify="space-between"
        align="center"
        p="1rem"
        boxShadow="md"
        bg="blue.500"
        background="black"
      >
        <Text color="white" mr="1rem" fontSize="2xl" fontWeight="bold">
          Honest Work
        </Text>
        <ConnectButton />
      </Flex>
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
        {/* <Flex justifyContent={"center"} my="4">
          <Link href="https://vitejs.dev" isExternal>
            <Image
              src={viteLogo}
              alt="Vite logo"
              h="6em"
              p="1.5em"
              transition="filter 300ms"
              _hover={{ filter: `drop-shadow(0 0 1em ${shadowColor})` }}
            />
          </Link>
          <Link href="https://react.dev" isExternal>
            <Image
              src={reactLogo}
              alt="React logo"
              h="6em"
              p="1.5em"
              transition="filter 300ms"
              _hover={{ filter: `drop-shadow(0 0 1em ${shadowColor})` }}
            />
          </Link>
        </Flex>
        <Text fontSize="2xl">
          Hardhat + Viem + Bun + Turbo + Vite + React + TS
        </Text>
        <Box p="2em" borderRadius="md" boxShadow="md">
          <Button
            colorScheme="blue"
            disabled={!Boolean(data?.request)}
            onClick={() => (data?.request ? writeContract(data.request) : null)}
          >
            {isLoading ? (
              <Text>Loading...</Text>
            ) : isError ? (
              <Text>Error</Text>
            ) : (
              <Text>Count is {count?.toString()}</Text>
            )}
          </Button>
          <Text mt="4">
            Edit <Text as="code">src/App.tsx</Text> and save to test HMR
          </Text>
        </Box>
        <Text mt="4" color={textColor}>
          Click on the Vite and React logos to learn more
        </Text> */}
      </Box>
    </>
  );
}

export default App;
