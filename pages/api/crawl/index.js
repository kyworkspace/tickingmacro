const puppeteer = require("puppeteer");

const excuteFunction = async (body) => {
    const {
        LoginWay,
        userId,
        userPw,
        startStation,
        endStation,
        startDate,
        startTime,
        endTime,
        AdultCount,
        ChildrenCount,
        seniorCount,
        HeavyDisabled,
        LightDisabled, } = body;


    // launch 메서드는 chrome을 실행시킴. headless는 ui를 제공하는지 안하는지 여부임. false로 해야 ui가 뜨고 아니면 백그라운드에서만 켜짐
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });

    // 새롭게 페이지를 만든다.
    const page = await browser.newPage();

    // goto는 url로 이동하는 메서드
    await page.goto("https://etk.srail.kr/cmc/01/selectLoginForm.do");

    //로그인 방식
    if (LoginWay === 1) {
        await page.click("#srchDvCd1"); //회원 번호
        await page.type("#srchDvNm01", userId);
        await page.type("#hmpgPwdCphd01", userPw);
        let ele = await page.$$("input[type=submit]");
        ele[0].click();
    } else if (LoginWay === 2) {
        await page.click("#srchDvCd2"); // 이메일
        await page.type("#srchDvNm02", userId);
        await page.type("#hmpgPwdCphd02", userPw);
        let ele = await page.$$("input[type=submit]");
        ele[1].click();
    } else if (LoginWay === 3) {
        await page.click("#srchDvCd3"); //회원 번호
        await page.type("#srchDvNm03", userId);
        await page.type("#hmpgPwdCphd03", userPw);
        //로그인 버튼
        let ele = await page.$$("input[type=submit]");
        ele[2].click();
    }



    // 로그인 후 새로운 페이지로 넘어갈 때 자연스럽게 넘겨주는 함수이다.
    await page.waitForNavigation();

    //조회페이지 이동
    await page.goto("https://etk.srail.kr/hpg/hra/01/selectScheduleList.do");



    const dptStation = startStation;
    const arvStation = endStation;
    let startTimeOptionValue = "00";
    let endTimeOptionValue = "24";
    //출발시간 조정
    if (Number(startTime) % 2 === 0) {
        startTimeOptionValue = startTime;
    } else {
        startTimeOptionValue = Number(startTime) - 1 < 10 ? `0${Number(startTime) - 1}` : (Number(startTime) - 1).toString();
    }
    //도착시간 조정
    if (Number(endTime) % 2 === 0) {
        endTimeOptionValue = endTime;
    } else {
        endTimeOptionValue = Number(endTime) + 1 < 10 ? `0${Number(endTime) + 1}` : (Number(endTime) + 1).toString();
    }
    const evaluateInitOption = async () => {
        await page.evaluate(
            (DS, AS, date, timeOption, adult, children, senior, headvyD, lightD) => {
                //출발역 지정
                document.querySelector("form#search-form").dptRsStnCd.value = DS;
                // document.querySelector("#dptRsStnCdNm").value = DS.name;
                //도착역
                document.querySelector("form#search-form").arvRsStnCd.value = AS;
                // document.querySelector("#arvRsStnCdNm").value = AS.name;
                //날짜
                document.querySelector("#dptDt").value = date;
                //시간                
                document.querySelector("#dptTm").value = timeOption + "0000";
                //인원수
                document.querySelector("select[name=psgInfoPerPrnb1]").value = adult;
                document.querySelector("select[name=psgInfoPerPrnb5]").value = children;
                document.querySelector("select[name=psgInfoPerPrnb4]").value = senior;
                document.querySelector("select[name=psgInfoPerPrnb2]").value = headvyD;
                document.querySelector("select[name=psgInfoPerPrnb3]").value = lightD;
            },
            dptStation,
            arvStation,
            startDate,
            startTimeOptionValue,
            AdultCount,
            ChildrenCount,
            seniorCount,
            HeavyDisabled,
            LightDisabled,
        );
    }
    //검색 조건 주입
    evaluateInitOption()

    const pageUp = async () => {
        await page.evaluate(`window.scrollTo(0, 0)`);
    };

    const onClickSearchButton = async () => {
        //스크롤 탑으로 이동
        pageUp();
        setTimeout(async () => {
            let searchButton = await page.$("input[type=submit]");
            searchButton.click();
            getSearch();
        }, 500)
    }

    /**
     * 
     * @param {*} _targetTime 대상시간
     * @param {*} dir 비교 방향
     * @param {*} _compareTime 내가 비교할 시간
     * @returns 
     */
    const timeCompare = (_targetTime, dir, _compareTime) => {
        //dir : "over" , "lower"
        const year = startDate.substring(0, 4)
        const month = startDate.substring(4, 6)
        const day = startDate.substring(6, 8)
        const targetTime = new Date(`${year}-${month}-${day} ${_targetTime}`);
        const compareTime = new Date(`${year}-${month}-${day} ${_compareTime}:00`)

        if (dir === "over") {
            if (targetTime >= compareTime) {
                return true
            } else {
                return false
            }
        } else if (dir === "lower") {
            if (targetTime <= compareTime) {
                return true
            } else {
                return false
            }
        }

    }
    const getSearch = async () => {
        if (page.isClosed()) {
            return false;
        } else {
            //조회 결과 테이블 ajax 호출이라
            setTimeout(async () => {
                await page.waitForSelector("tbody", { timeout: 10000 })
                let result = false;
                let skip = false;
                const trs = await page.$$("tbody > tr")
                for (const [index, tr] of trs.entries()) {
                    if (!result) {
                        const tds = await tr.$$("td");

                        //지정한 시간인지 확인
                        const timeEle = await tds[3].$("em");
                        const timeText = await (await timeEle.getProperty("textContent")).jsonValue();

                        if (!timeCompare(timeText, "lower", endTime)) skip = true; //지정 시간을 초과한 경우에는 break

                        if (timeCompare(timeText, "over", startTime) && timeCompare(timeText, "lower", endTime)) {
                            //예약하기 버튼칸
                            const aTag = await tds[6].$("a");
                            const text = await (await aTag.getProperty("textContent")).jsonValue();
                            if (text === "예약하기") {
                                result = true;
                                aTag.click();
                                setTimeout(async () => {
                                    console.log(`${++searchCount}회째 검색 후 예약 되었습니다.`)
                                }, 1000)
                                break;
                            }
                        }
                    } else {
                        break;
                    }
                }
                if (!result) {
                    //같은 날 다음 페이지가 있으면 다음페이지 이동
                    const btn = await page.$(".tal_r > input[type=button].btn_burgundy_dark")
                    const btnText = await (await btn.getProperty("value")).jsonValue()
                    if (btn && btnText === "다음" && !skip) {
                        btn.click();
                        setTimeout(getSearch, 1000)
                    } else {
                        evaluateInitOption();
                        onClickSearchButton();
                    }
                }
            }, 1000)
        }

    }
    setTimeout(onClickSearchButton, 500)
}


export default async function crawl(req, res) {


    const { method, body } = req;

    if (method === "POST") {
        try {

            await excuteFunction(body);

            res.status(200).json({
                success: true
            })
        } catch (error) {
            res.status(400).json({ error })
        }
    }

}