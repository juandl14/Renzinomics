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

const PENSIONS_CONTRACT_ADDRESS = "0xYOUR_CONTRACT_ADDRESS";
const CFAv1ForwarderAddress = "0x2CDd45c5182602a36d391F7F16DD9f8386C3bD8D";
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
    addressOrName: address,
    token: TIME_TOKEN_ADDRESS,
  });
  const [retirementAge, setRetirementAge] = useState<BigNumber | undefined>();
  const [userAge, setUserAge] = useState<BigNumber | undefined>();

  const { data: contractRetirementAge } = useContractRead({
    address: PENSIONS_CONTRACT_ADDRESS,
    abi: PensionsABI,
    functionName: "retirementAge",
    watch: true,
  });

  useEffect(() => {
    if (contractRetirementAge) {
      setRetirementAge(contractRetirementAge as BigNumber);
    }
  }, [contractRetirementAge]);

  useEffect(() => {
    if (!isConnected || !address) return;

    const provider = useProvider();
    const timeContract = new viem.Contract(
      TIME_TOKEN_ADDRESS,
      TIME_TOKEN_ABI,
      provider
    );

    const fetchUserAge = async () => {
      const userBalance = await timeContract.read({
        functionName: "balanceOf",
        args: [address],
      });
      setUserAge(BigNumber.from(userBalance));
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
            {userAge?.gte(retirementAge || 0) ? (
              <Button onClick={handleClaimPension}>Claim Pension</Button>
            ) : (
              <Text>You are not eligible for pension yet.</Text>
            )}
          </Stack>
        </CardBody>
      </Card>
    )
  );

  function handleClaimPension() {
    // Logic to call claimPension() on the contract
    console.log("Claiming pension!");
  }
}

function Actions() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const [contributionAmount, setContributionAmount] = useState("");
  const [open, setOpen] = useState(false);
  const [monthlyFlowRate, setMonthlyFlowRate] = useState<number | string>("");
  const [flowRate, setFlowRate] = useState<string>("");
  const {
    data: hash,
    error,
    isPending,
    write: createFlow,
  } = useContractWrite({
    address: PENSIONS_CONTRACT_ADDRESS,
    abi: PensionsABI,
    functionName: "createFlow",
  });
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });
  const { writeContract } = useContractWrite();

  const handleContribute = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isConnected || !address) return;

    createFlow({
      args: [parseEther(contributionAmount)],
    });
  };

  const openDialog = () => {
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

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

  return isConnected ? (
    <Card mt="6">
      <CardBody>
        <Stack spacing="3">
          <Heading size="md">Actions</Heading>
          <form onSubmit={handleContribute}>
            <FormControl>
              <FormLabel>Contribute more (ETH)</FormLabel>
              <Input
                type="number"
                placeholder="Contribution amount (ETH)"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                required
              />
            </FormControl>
            <Button disabled={isPending} type="submit">
              {isPending ? "Contributing..." : "Contribute"}
            </Button>
          </form>
          {hash && <div>Transaction Hash: {hash}</div>}
          {isConfirming && <div>Waiting for confirmation...</div>}
          {isConfirmed && <div>Contribution successful!</div>}
          {error && <div>Error: {error.message}</div>}

          <Button data-cy={"open-dialog"} onClick={openDialog}>
            Start Stream
          </Button>
        </Stack>
      </CardBody>
    </Card>
  ) : (
    <>
      <Text>Please connect your wallet to start playing.</Text>
      <ul>
        {connectors.map((connector) => (
          <li key={connector.id}>
            <Button onClick={() => connect({ connector })}>
              {connector.name}
            </Button>
          </li>
        ))}
      </ul>
    </>
  );
}

const StreamModal = ({
  open,
  closeDialog,
  flowRate,
  onMonthlyFlowRateChange,
  writeContract,
}) => (
  <Modal isOpen={open} onClose={closeDialog}>
    <ModalContent>
      <ModalHeader>Your way to freedom</ModalHeader>
      <ModalBody>
        To start working honestly, we kindly ask you to give us your money by
        creating a stream. Select the amount of AVAX you want to stream monthly.
        <NumberInput
          onChange={(valueString) => onMonthlyFlowRateChange(valueString)}
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
            writeContract({
              abi: CFAv1ForwarderABI,
              address: CFAv1ForwarderAddress,
              functionName: "createFlow",
              args: [
                "0xfFD0f6d73ee52c68BF1b01C8AfA2529C97ca17F3",
                "0x178A621F2bbC191f8819e4a9C08C85Ce007D2094",
                flowRate,
              ],
            })
          }
        >
          Create stream
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

export default Home;
