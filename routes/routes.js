var express = require("express");
var router = express.Router();
var {teamSchema} = require("../modal/user");


let fetchPlayerTeam = () => {
    return new Promise(function (resolve, reject) {
        teamSchema.find({}, {}, {"sort": {"priority": 1}}, (err, data) => {

            if (data) {
                let domesticData = []
                let Data = []
                data.forEach(team => {
                    if (team.isDomestic)
                        domesticData.push(team)
                    else
                        Data.push(team)
                })

                /*
                 DOMESTIC-TEAM MEANS DATA WHICH ARE MARKED AS DOMESTIC
                 NON-DOMESTIC-TEAM MEANS DATA WHICH ARE MARKED AS NON DOMESTIC
                 */

                return resolve({
                    domesticTeam: domesticData,
                    nonDomesticTeam: Data
                });
            } else {
                return reject(err);
            }
        });
    });
};

router.all("/get-team", (req, res) => {
    let finalArray = {};
    let groups = ["Group A", "Group B", "Group C", "Group D", "Group E", "Group F", "Group G", "Group H"];

    /*
     HERE FIRST I FETCH ALL THE TEAMS FROM THE DATABASE I HAVE USED PROMISE FOR THAT CASE AS IT IS I/O OPERATION
     */

    fetchPlayerTeam()
        .then(detail => {

            /*
             HERE THE CODE WILL PROCEED IF WE GET A PROMISE THAT MEANS WE RESOLVE THE DATA FROM THE DATABASE
             */

            let data = [...detail.nonDomesticTeam]
            let domestic = [...detail.domesticTeam];

            /*
             DATA IS THE NON-DOMESTIC DATA
             DOMESTIC CONTAIN THE DOMESTIC DATA
             */

            let shuffledData = shuffleArray(data);
            let shuffledDomesticData = shuffleArray(domestic)
            /*
             NOW THE ABOVE CODE SHUFFLES THE DATA WITH FUNCTION //SHUFFLEARRAY//
             */
            groups.forEach((group, index) => {
                finalArray[group] = [shuffledDomesticData[index]]
            })

            /*
             IN THE ABOVE FIRST I HAVE ASSIGNED ALL THE DOMESTIC TEAMS TO THE GROUP
             */

            let newShuffledData = []
            /*
             NOW BELOW WE WILL ASSIGN ALL THE NON-DOMESTIC TEAMS TO THE  GROUPS
             */
            newShuffledData.length = 0
            for (let group in finalArray) {
                if (true) {
                    let team = finalArray[group]
                    for (let i = 1; i < 4; i++) {
                        for (let j = 0; j < shuffledData.length; j++) {
                            let status = newShuffledData[j]
                            if (status !== true) {
                                let isPresent = false
                                let newVal = new Number(i)
                                for (let k = 0; k < newVal; k++) {
                                    if (team[k].country === shuffledData[j].country) {
                                        isPresent = true
                                        break;
                                    }
                                }
                                if (!isPresent) {
                                    newShuffledData[j] = true
                                    team[i] = shuffledData[j]
                                    break;
                                }
                            }
                        }
                    }
                    finalArray[group] = team
                }
            }

            /*
             HERE ABOVE WHAT I AM DOING IS
             1) I TOOK ONE GROUP (i.e: GROUP A)

             2) THEN I ITERATED FOR EACH ITS ARRAY (i.e: THE ARRAY IN WHICH I AM MAINTAING ITS TEAM FOR GROUP A)

             3) IF I AM INSERTING AT 2nd POSITION OF THE ARRAY FOR GROUP A. THEN FOR THE CURRENT TEAM BEING POINTED
             BY THE LOOP I STARTED A LOOP FOR THE ARRAY WHERE ALL THE TEAM ARE KEPT (i.e SUFFLEDDATA)

             4) IF THE CUURENT COUNTRY POINTED ON THE SHUFFLED-DATA ARRAY IS PRESENT IN THE GROUP BEING OPERATION IS PERFORMED
             THE IT WILL NOT BE INSERTED INTO THE ARRAY OF THE GROUP ON WHICH WE ARE PERFORMING THE ACTION

             5) IF THE CURREMT TEAM IS NOT PRESENT IN THE GROUP WE INSERT IT IN THE GROUP AND MARK THAT TEAM
             IN SHUFFLEDDATA AS MARKED TRUE ( MAINTAINED IN NEW-SHUFFLED-DATA ARRAY)
             */


            /*

             IS RARE CASE ON PROBLEM ARISES AS FOR LAST GROUP 4 TEAMS ARE LEFT BUT ONE WITH THE SAME TEAMS
             BELOW THE CODE FIX IT BY FOLLOWING OPERATION

             1) I WILL CHECK WHICH GROUP CONTAINS THE TEAMS WHOSE COUNTRY IS NOT MATCHECD WITH THE LEFT TEAM
             2) AFTER MATCHING I WILL CHECK WHICH TEAM DOESNT MATCHED IN THE LAST GROUP
             3) AFTER FINDING IT I WILL REPLACE THE TEAM LEFT IN SHUFFLED-DATA ARRAY IN THAT GROUP
             4) THE TEAM BEING REPLACED IN THE PARTICULAR IS INSERTED IN THE LAST GROUP

             */

            try {
                let isPresents = false
                let left = []
                for (let i = 0; i < shuffledData.length; i++) {
                    if (newShuffledData[i] !== true) {
                        isPresents = true
                        left.push(new Object(shuffledData[i]))
                    }
                }
                if (isPresents) {
                    let end = false
                    for (group in finalArray) {
                        let present = false
                        for (let i = 0; i < finalArray[group].length; i++) {
                            if (finalArray[group][i].country === left[0].country) {
                                present = true
                            }
                        }

                        if (!present) {
                            for (let i = 0; i < finalArray[group].length; i++) {
                                let jCountry = false
                                for (let j = 0; j < finalArray["Group H"].length; j++) {
                                    if ((finalArray["Group H"][j].country == finalArray[group][i].country) || finalArray[group][i].country.isDomestic)
                                        jCountry = true
                                }
                                // console.log("jCountru",jCountry)
                                if (!jCountry && !finalArray[group][i].isDomestic) {
                                    console.log("in jquery")
                                    let tempArray = [...finalArray["Group H"]]
                                    tempArray.push(finalArray[group][i])
                                    finalArray[group][i] = left[0]
                                    left.splice(0, 1)
                                    finalArray["Group H"] = tempArray
                                    if (finalArray["Group H"].length === 4)
                                        end = true
                                    break;
                                }

                            }
                        }


                        if (end)
                            break;
                    }
                }
            }
            catch (e) {
                res.send(e)
            }
            res.render("team", {finalArray: finalArray}) // SENDING THE DATA TO EJS FOR CREATING TEMPLATE
        })
        .catch(err => {
            res.send(err);
        });
});

var shuffleArray = data => { // FUNCTION TO SHUFFLE THE TEAMS
    let array = data;
    array.sort(function () {
        return Math.random() - 0.5;
    });
    return array;
};

module.exports = router;
