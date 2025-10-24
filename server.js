import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

const packageDef = protoLoader.loadSync("calculator.proto");
const grpcObject = grpc.loadPackageDefinition(packageDef).calculator;

// Fungsi Add
function add(call, callback) {
  const { a, b } = call.request;
  callback(null, { result: a + b });
}

// Fungsi Subtract
function subtract(call, callback) {
  const { a, b } = call.request;
  callback(null, { result: a - b });
}

// Fungsi MultiplyStream
function multiplyStream(call) {
  const { number } = call.request;
  for (let i = 1; i <= 10; i++) {
    call.write({ step: i, result: number * i });
  }
  call.end();
}

// Fungsi Average
function average(call, callback) {
  let sum = 0;
  let count = 0;

  call.on("data", (req) => {
    sum += req.value;
    count++;
  });

  call.on("end", () => {
    const avg = count === 0 ? 0 : sum / count;
    callback(null, { average: avg });
  });
}

// Fungsi Max (method baru)
function max(call, callback) {
  let maxVal = Number.NEGATIVE_INFINITY;

  call.on("data", (req) => {
    if (req.value > maxVal) {
      maxVal = req.value;
    }
  });

  call.on("end", () => {
    callback(null, { max: maxVal });
  });
}

// Server
const server = new grpc.Server();

server.addService(grpcObject.Calculator.service, {
  HitungPersegi: add,
  HitungPersegiPanjang: subtract,
  HitungSegitiga: multiplyStream,
  HitungLingkaran: average,
  Max: max,
});

server.bindAsync(
  "0.0.0.0:50551",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("gRPC server running on port 50551");
  }
);
