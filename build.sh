echo 'Starts build'
cd client
npm run build
cd ../server
rm -r node_modules/client
npm install
cd ../examples/wordcount
rm -r node_modules/client
npm install
cd ../..
echo 'Ends build'
