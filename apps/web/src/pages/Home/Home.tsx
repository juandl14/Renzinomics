import React, { useEffect, useState, ChangeEvent } from "react";
import {
  Box,
  Stack,
  Text,
  Divider,
  Button,
  Input,
  FormControl,
  FormLabel,
  Card,
  CardBody,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  NumberInput,
  NumberInputField,
  useToast,
} from "@chakra-ui/react";
import {
  useAccount,
  useConnect,
  useContractWrite,
  useWaitForTransactionReceipt,
  useBalance,
  useSwitchChain,
  useProvider,
  useContractRead,
} from "wagmi";
import { parseEther } from "viem";
import { BigNumber } from "ethers";
import PensionsABI from "./PensionsABI.json";
import CFAv1ForwarderABI from "../../assets/CFAv1ForwarderABI/CFAv1ForwarderABI.json";
import "./Home.css";

// **Contract Addresses**
const PENSIONS_CONTRACT_ADDRESS = "0xYOUR_CONTRACT_ADDRESS";
const CFAv1ForwarderAddress = "0x2CDd45c5182602a36d391F7F16DD9f8386C3bD8D";

// **Token Addresses & ABIs**
const CASH_TOKEN_ADDRESS = "YOUR_CASH_TOKEN_ADDRESS";
const TIME_TOKEN_ADDRESS = "YOUR_TIME_TOKEN_ADDRESS";
const TIME_TOKEN_ABI = [
  // ... (Your TIME token ABI)
];

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
          <div className="container top-right">
            <PlayerStatus />
          </div>
          <div className="container bottom-right">
            <Actions />
          </div>
        </div>
      </Box>
    </>
  );
};

function PlayerStatus() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address: address,
    token: TIME_TOKEN_ADDRESS,
  });
  const [retirementAge, setRetirementAge] = useState<bigint | undefined>();
  const [userAge, setUserAge] = useState<bigint | undefined>();

  // Read the retirement age from the contract
  const { data: contractRetirementAge } = useContractRead({
    address: PENSIONS_CONTRACT_ADDRESS,
    abi: PensionsABI,
    functionName: "retirementAge",
    watch: true, // Automatically re-fetch when a new block is mined
  });

  useEffect(() => {
    if (contractRetirementAge) {
      setRetirementAge(contractRetirementAge as bigint);
    }
  }, [contractRetirementAge]);

  // Fetch and calculate the user's age in TIME tokens
  useEffect(() => {
    if (!isConnected || !address) return;
    const provider = useProvider();

    const fetchUserAge = async () => {
      const timeContract = new viem.Contract(
        TIME_TOKEN_ADDRESS,
        TIME_TOKEN_ABI,
        provider
      );
      const userBalance = await timeContract.read.balanceOf([address]);
      setUserAge(userBalance as bigint);
    };
    fetchUserAge();
  }, [isConnected, address]);

  return (
    isConnected && (
      <Card mt="6">
        <CardBody>
          <Stack spacing="3">
            <Heading size="md">Player Status</Heading>
            <Text>Balance (TIME): {balance?.formatted}</Text>
            <Text>Retirement Age: {retirementAge?.toString()}</Text>
            <Text>Your Age: {userAge?.toString()}</Text>
            <Divider />
            {/* Conditionally render the claim button */}
            {userAge ? (
              userAge >= retirementAge ? (
                <Button onClick={handleClaimPension}>Claim Pension</Button>
              ) : (
                <Text>You are not eligible for a pension yet.</Text>
              )
            ) : (
              <Text>Loading...</Text>
            )}
          </Stack>
        </CardBody>
      </Card>
    )
  );

  // Claim Pension handler
  function handleClaimPension() {
    // Logic to call claimPension() on the contract
    console.log("Claiming pension!");
  }
}

function Actions() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  const toast = useToast();

  // Contribution State
  const [contributionAmount, setContributionAmount] = useState("");
  const handleContributionChange = (event: ChangeEvent<HTMLInputElement>) => {
    setContributionAmount(event.target.value);
  };

  // Superfluid Stream State
  const [open, setOpen] = useState(false);
  const [monthlyFlowRate, setMonthlyFlowRate] = useState("");
  const [flowRate, setFlowRate] = useState<string>("");

  // Create flow using CFAv1ForwarderABI
  const {
    data: createFlowHash,
    error: createFlowError,
    isPending: isCreateFlowPending,
    writeAsync: createFlow,
  } = useContractWrite({
    address: CFAv1ForwarderAddress,
    abi: CFAv1ForwarderABI,
    functionName: "createFlow",
  });
  const {
    isLoading: isCreateFlowConfirming,
    isSuccess: isCreateFlowConfirmed,
  } = useWaitForTransactionReceipt({
    hash: createFlowHash,
  });

  // Write to the Pensions contract
  const { writeAsync: pensionsContractWrite } = useContractWrite({
    address: PENSIONS_CONTRACT_ADDRESS,
    abi: PensionsABI,
  });

  // Handle Contribution
  const handleContribute = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isConnected || !address) return;

    // Call the contract's createFlow function (make sure it takes ETH)
    try {
      const hash = await pensionsContractWrite({
        functionName: "createFlow", // [!code focus]
        args: [parseEther(contributionAmount)],
      });

      if (hash) {
        toast({
          title: "Contribution Pending",
          description: `Transaction hash: ${hash}`,
          status: "info",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      toast({
        title: "Contribution Error",
        description: error?.message || "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle Monthly Flow Rate Change
  const onMonthlyFlowRateChange = (valueString: string) => {
    setMonthlyFlowRate(valueString);
    const monthlyFlowRateValue = Number(valueString);
    if (!isNaN(monthlyFlowRateValue)) {
      const normalizedOutflowRate = (
        (monthlyFlowRateValue * 1e18) /
        ((60 * 60 * 24 * 365) / 12)
      ).toFixed(0);
      setFlowRate(normalizedOutflowRate);
    }
  };

  const openDialog = () => {
    setOpen(true);
  };
  const closeDialog = () => {
    setOpen(false);
  };

  return isConnected ? (
    <Card mt="6">
      <CardBody>
        <Stack spacing="3">
          <Heading size="md">Actions</Heading>

          {/* Contribution Form */}
          <form onSubmit={handleContribute}>
            <FormControl>
              <FormLabel>Contribute more (ETH)</FormLabel>
              <Input
                type="number"
                placeholder="Contribution amount (ETH)"
                value={contributionAmount}
                onChange={handleContributionChange}
                required
              />
            </FormControl>
            <Button disabled={isCreateFlowPending} type="submit">
              {isCreateFlowPending ? "Contributing..." : "Contribute"}
            </Button>
          </form>
          {createFlowHash && <div>Transaction Hash: {createFlowHash}</div>}
          {isCreateFlowConfirming && <div>Waiting for confirmation...</div>}
          {isCreateFlowConfirmed && <div>Contribution successful!</div>}
          {createFlowError && <div>Error: {createFlowError.message}</div>}

          {/* Stream Button and Modal */}
          <Button data-cy={"open-dialog"} onClick={openDialog}>
            Start Stream
          </Button>
        </Stack>
      </CardBody>
      <Modal isOpen={open} onClose={closeDialog}>
        <ModalContent>
          <ModalHeader>Your way to freedom</ModalHeader>
          <ModalBody>
            To start working honestly, we kindly ask you to give us your money
            by creating a stream. Select the amount of AVAX you want to stream
            monthly.
            <NumberInput
              onChange={onMonthlyFlowRateChange}
              value={monthlyFlowRate}
              max={50}
            >
              <NumberInputField />
            </NumberInput>
          </ModalBody>
          <ModalFooter>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button
              type="submit"
              onClick={() =>
                createFlow({
                  args: [
                    CASH_TOKEN_ADDRESS, // Your super token address
                    PENSIONS_CONTRACT_ADDRESS,
                    flowRate,
                    "0x", // userData - can be left blank for this example
                  ],
                })
              }
            >
              Create stream
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  ) : (
    <>
      <Text>Please connect your wallet to start playing.</Text>
      <ul>
        {connectors.map((connector) => (
          <li key={connector.uid}>
            <Button onClick={() => connect({ connector })}>
              {connector.name}
            </Button>
          </li>
        ))}
      </ul>
    </>
  );
}

export default Home;
