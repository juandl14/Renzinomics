import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import CFAv1ForwarderABI from "../../assets/CFAv1ForwarderABI/CFAv1ForwarderABI.json";
import "./Home.css";
import { useAccount, useWriteContract } from "wagmi";
import { ChangeEvent, useEffect, useState } from "react";

const CFAv1ForwarderAddress = "0x2CDd45c5182602a36d391F7F16DD9f8386C3bD8D"; // Replace with the actual CFAv1 Forwarder contract address

const Home = () => {
  const [open, setOpen] = useState(false);
  const [monthlyFlowRate, setmonthlyFlowRate] = useState<Number>();
  const [flowRate, setFlowRate] = useState<string>("");
  // const { address, isConnected } = useAccount();

  const { writeContract } = useWriteContract();

  const openDialog = () => {
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  const onMonthlyFlowRateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setmonthlyFlowRate(e.target.value);
  };

  // useEffect(() => {
  //   if (monthlyFlowRate) {
  //     const monthlyFlowRateValue = Number(monthlyFlowRate);
  //     if (!isNaN(monthlyFlowRateValue)) {
  //       const normalizedOutflowRate = (
  //         (monthlyFlowRateValue * 1e18) /
  //         ((60 * 60 * 24 * 365) / 12)
  //       ).toFixed(0);
  //       setFlowRate(normalizedOutflowRate);
  //     }
  //   }
  // }, [monthlyFlowRate]);

  // const startStream = (e: )

  return (
    <>
      <Box textAlign="center" className="box-container">
        <Modal
          isOpen={open}
          onClose={closeDialog}
          // PaperProps={{
          //   component: "form",
          //   onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          //     event.preventDefault();
          //     const formData = new FormData(event.currentTarget);
          //     const formJson = Object.fromEntries((formData as any).entries());
          //     const email = formJson.email;
          //     console.log(email);
          //     closeDialog();
          //   },
          // }}
        >
          <ModalContent>
            <ModalHeader>Your way to freedom</ModalHeader>
            <ModalBody>
              To start working honestly, we kindly ask you to give us your money
              by creating a stream. Select the amount of AVAX you want to stream
              monthly.
              {/* <TextField
                value={monthlyFlowRate}
                onChange={onMonthlyFlowRateChange}
              /> */}
              <NumberInput
                onChange={(valueString) =>
                  setmonthlyFlowRate(parse(valueString))
                }
                value={format(value)}
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
                    //@ts-ignore
                    CFAv1ForwarderABI,
                    address: CFAv1ForwarderAddress,
                    functionName: "createFlow",
                    args: [
                      "0xfFD0f6d73ee52c68BF1b01C8AfA2529C97ca17F3",
                      "0x178A621F2bbC191f8819e4a9C08C85Ce007D2094", // change for real contract address
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
            <Button data-cy={"open-dialog"} onClick={openDialog}>
              Start
            </Button>
          </div>
        </div>
      </Box>
    </>
  );
};

export default Home;
