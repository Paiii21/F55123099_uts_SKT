import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import readline from "node:readline/promises";

async function main() {
    const packageDef = protoLoader.loadSync("calculator.proto");
    const grpcObject = grpc.loadPackageDefinition(packageDef).calculator;

    const client = new grpcObject.Calculator(
        "localhost:50551",
        grpc.credentials.createInsecure()
    );

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    console.log("1. HitungPersegi\n2. HitungSegitiga\n3. HitungPersegiPanjang\n4. HitungLingkaran\n");
    const option = await rl.question("Pilih method yang ingin dijalankan (1-4): ");

    switch (option) {
        case "1": {
            const a = parseInt(await rl.question("Masukkan angka pertama: "));
            const b = parseInt(await rl.question("Masukkan angka kedua: "));
            client.HitungPersegi({ a, b }, (err, res) => {
                if (err) console.error(err);
                else console.log("Hasil penjumlahan:", res.result);
            });
            break;
        }

        case "2": {
            const a = parseInt(await rl.question("Masukkan angka pertama: "));
            const b = parseInt(await rl.question("Masukkan angka kedua: "));
            client.HitungSegitiga({ a, b }, (err, res) => {
                if (err) console.error(err);
                else console.log("Hasil pengurangan:", res.result);
            });
            break;
        }

        case "3": {
            const num = parseInt(
                await rl.question("Masukkan angka untuk tabel perkalian: ")
            );
            const stream = client.HitungPersegiPanjang({ number: num });
            stream.on("data", (res) => {
                console.log(`${num} x ${res.step} = ${res.result}`);
            });
            stream.on("end", () => console.log("Tabel perkalian selesai"));
            break;
        }

        case "4": {
            const avgCall = client.HitungLingkaran((err, res) => {
                if (err) console.error(err);
                else console.log("Rata-rata:", res.average);
            });

            let input;
            console.log(
                'Masukkan angka untuk dihitung rata-rata (ketik "done" jika selesai):'
            );

            while (true) {
                input = await rl.question("> ");
                if (input.toLowerCase() === "done") break;
                const num = parseInt(input);
                if (!isNaN(num)) avgCall.write({ value: num });
            }

            avgCall.end();
            break;
        }

        default:
            console.log("Pilihan tidak valid");
            break;
    }

    rl.close();
}

main();
