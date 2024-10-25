import { type MockControllerBehavior } from "@zwave-js/testing";
import { wait } from "alcalzone-shared/async";
import { integrationTest } from "../integrationTestSuite";

integrationTest(
	"The bootloader is detected when received in smaller chunks",
	{
		// Reproduction for issue #7316
		// debug: true,

		additionalDriverOptions: {
			allowBootloaderOnly: true,
		},

		async customSetup(driver, mockController, mockNode) {
			const sendBootloaderMessageInChunks: MockControllerBehavior = {
				async onHostData(host, self, ctrl) {
					// if (
					// 	ctrl.length === 1
					// 	&& (ctrl[0] === MessageHeaders.NAK || ctrl[0] === 0x32)
					// ) {
					self.serial.emitData(
						Buffer.from("\0\r\nGecko Bootloa", "ascii"),
					);
					await wait(20);
					self.serial.emitData(Buffer.from(
						`der v2.05.01
1. upload gbl
2. run
3. ebl info
BL >\0`,
						"ascii",
					));
					return true;
					// }
				},
			};
			mockController.defineBehavior(sendBootloaderMessageInChunks);
		},

		testBody: async (t, driver, node, mockController, mockNode) => {
			t.true(driver.isInBootloader());
		},
	},
);