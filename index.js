const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'archive');

const eligibilityDeptWise = {};
let counter = 0;

fs.readdir(directoryPath, function (err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    files.forEach(function (file) {
        fs.readFile(path.join(directoryPath, file), 'utf-8', (err, content) => {
          if (err) {
            console.log('Unable to find file: ' + err);
            return;
          }
          const { document } = new JSDOM(content).window;
          const eligibilityTable = document.querySelector('.table-sm.text-center');
          const cells = eligibilityTable.querySelectorAll('td');
          const rows = cells.length / 13;
          const numDepartments = rows - 1;
          for (let dept = 0; dept < numDepartments; dept++) {
            for (let program = 0; program < 12; program++) {
              if(cells[(dept+1)*13 + program + 1].textContent.toLowerCase().trim() === 'y') {
                const deptName = cells[(dept+1)*13].textContent.toUpperCase().trim();
                const programName = cells[(program+1)].textContent.toUpperCase().trim();
                if(eligibilityDeptWise[deptName] && eligibilityDeptWise[deptName][programName]) {
                  eligibilityDeptWise[deptName][programName].push(file);
                } else if(eligibilityDeptWise[deptName]) {
                  eligibilityDeptWise[deptName][programName] = [file];
                } else {
                  eligibilityDeptWise[deptName] = {
                    [programName]: [file]
                  };
                }
              }
            }
          }
          counter += 1;
          if(counter === files.length) {
            console.log(eligibilityDeptWise);
            fs.writeFile('search.json', JSON.stringify(eligibilityDeptWise, null, 2), (err)=> {
              if(err) {
                console.log(err);
              } else {
                console.log("JSON saved to " + 'search.json');
              }
            }
            );
          }
        });
    });
    console.log(`JDs: ${files.length}`);
});
