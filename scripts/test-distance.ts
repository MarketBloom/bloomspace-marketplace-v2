import { testDistanceCalculation } from "../src/utils/test-distance";

async function main() {
  console.log('Testing HERE API route calculation...');
  await testDistanceCalculation();
}

main().catch(console.error);
