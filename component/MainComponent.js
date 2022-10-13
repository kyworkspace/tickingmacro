import moment from "moment/moment";
import React, { useEffect, useState } from "react";
import styled from "styled-components";


const Body = styled.div`
    padding : 20px;
    background-color: #3c3c3c;
    height: 100vh;
    overflow-y: auto;

`
const Contents = styled.div`
    border: 1px solid lightgray;
    width: 100%;
    height: 100%;
    background-color: beige;
    border-radius: 10px;
    padding: 5px;
    overflow-y: auto;
`

const ContentsBody = styled.div`
    min-height: 300px;
    
`

const Information = styled.div`
    border-top: 1px solid #3c3c3c;
    margin-top: 10px;
`
const Row = styled.div`
    display: flex;
    gap: 2px;
    flex-wrap: wrap;
`

const InputDiv = styled.div`
    display: flex;
    gap: 5px;
    min-width: 250px;
    min-height: 50px;
    align-items: center;
    & input{
        width: 60%;
        border: 1px solid lightgray;
        padding: 2px 3px;
        border-radius: 5px;
    }
    & select{
        width: auto;
        border: 1px solid lightgray;
        padding: 2px 3px;
        border-radius: 5px;

    }
`

const CategoryTitle = styled.div`
    min-width: 150px;
    width: 150px;
    & div{
        border-bottom: 3px solid tomato;
        font-size: larger;
        font-weight: 600;
        height: 40px;
        display: inline-block;
        align-items: center;
        display: flex;
    }
`
const SearchButton = styled.button`
    width: 200px;
    height: 50px;
    border:none;
    font-size: larger;
    border-radius: 5px;
    background-color: #572b4c;
    color: white;
    cursor: pointer;
`

const LocationOptions = [
    { name: "수서", stationCode: "0551", className: "map-01" },
    { name: "동탄", stationCode: "0552", className: "map-02" },
    { name: "평택지제", stationCode: "0553", className: "map-03" },
    { name: "천안아산", stationCode: "0502", className: "map-04" },
    { name: "오송", stationCode: "0297", className: "map-05" },
    { name: "대전", stationCode: "0010", className: "map-06" },
    { name: "김천구미", stationCode: "0507", className: "map-07" },
    { name: "서대구", stationCode: "0506", className: "map-19" },
    { name: "동대구", stationCode: "0015", className: "map-09" },
    { name: "신경주", stationCode: "0508", className: "map-09" },
    { name: "울산", stationCode: "0509", className: "map-10" },
    { name: "부산", stationCode: "0020", className: "map-11" },
    { name: "공주", stationCode: "0514", className: "map-12" },
    { name: "익산", stationCode: "0030", className: "map-14" },
    { name: "정읍", stationCode: "0033", className: "map-15" },
    { name: "광주송정", stationCode: "0036", className: "map-16" },
    { name: "나주", stationCode: "0037", className: "map-17" },
    { name: "목포", stationCode: "0041", className: "map-18" },

]
function MainComponent() {

    //option status
    const [LoginWay, setLoginWay] = useState(1);
    const [userId, setUserId] = useState("");
    const [userPw, setUserPw] = useState("");
    const [startStation, setStartStation] = useState("0551");
    const [endStation, setEndStation] = useState("0020");
    const [startDate, setStartDate] = useState(moment().format("yyyyMMDD"));
    const [startTime, setStartTime] = useState(moment().format("HH"));
    const [endTime, setEndTime] = useState("23");
    const [AdultCount, setAdultCount] = useState(1);
    const [ChildrenCount, setChildrenCount] = useState(0);
    const [seniorCount, setSeniorCount] = useState(0);
    const [HeavyDisabled, setHeavyDisabled] = useState(0);
    const [LightDisabled, setLightDisabled] = useState(0);


    //출발날짜 현재날로 + 30일
    const [startDateOptions, setStartDateOptions] = useState([]);

    useEffect(() => {
        const options = Array(31).fill().map((item, idx) => {
            const mo = moment();
            mo.add(idx, "day")
            const obj = {
                value: mo.format("yyyyMMDD"),
                text: mo.format("yyyy-MM-DD")
            }
            return obj
        })
        setStartDateOptions(options)
    }, []);




    const onStartMacro = async () => {
        if (!userId) {
            return alert("회원 아이디를 입력해주세요")
        }
        if (!userPw) {
            return alert("회원 비밀번호를 입력해주세요")
        }
        if (AdultCount +
            ChildrenCount +
            seniorCount +
            HeavyDisabled +
            LightDisabled === 0) {
            return alert("인원 수를 선택해주세요.")
        }

        const body = {
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
            LightDisabled,
        }

        await fetch("/api/crawl", {
            method: 'POST',
            body: JSON.stringify(body),
            headers: new Headers({
                "Content-Type": "application/json",
            }),
        }).then(async res => {
            const result = await res.json();
            alert("매크로가 실행되었습니다. 시작표시줄 또는 새롭게 활성화되는 브라우저를 확인해주세요.")
        }).catch(err => {

        }).finally(() => {
            console.log("finally")
        })
    }


    return (
        <Body>
            <Contents>
                <h3>
                    자동 예약 프로그램
                </h3>
                <hr />
                <ContentsBody>
                    <CategoryTitle>
                        <div>
                            필수 입력 사항
                        </div>

                    </CategoryTitle>
                    <Row>
                        <InputDiv>
                            <span>로그인 방법</span>
                            <select value={LoginWay} onChange={e => setLoginWay(Number(e.target.value))}>
                                <option value={1}>회원 번호</option>
                                <option value={2}>이메일</option>
                                <option value={3}>휴대전화 번호</option>
                            </select>
                        </InputDiv>
                        <InputDiv>
                            <span>회원 아이디</span>
                            <input value={userId} onChange={e => setUserId(e.target.value)} />
                        </InputDiv>
                        <InputDiv>
                            <span>회원 비밀번호</span>
                            <input type={"password"} value={userPw} onChange={e => setUserPw(e.target.value)} />
                        </InputDiv>
                    </Row>
                    <Row>
                        <InputDiv>
                            <span>출발역</span>
                            <select value={startStation} onChange={e => setStartStation(e.target.value)}>
                                {LocationOptions.map(lo => {
                                    return <option value={lo.stationCode} key={lo.stationCode}>{lo.name}</option>
                                })}
                            </select>
                        </InputDiv>
                        <InputDiv>
                            <span>도착역</span>
                            <select value={endStation} onChange={e => setEndStation(e.target.value)}>
                                {LocationOptions.map(lo => {
                                    return <option value={lo.stationCode} key={lo.stationCode}>{lo.name}</option>
                                })}
                            </select>
                        </InputDiv>
                        <InputDiv>
                            <span>출발 날짜</span>
                            <select value={startDate} onChange={e => setStartDate(e.target.value)}>
                                {startDateOptions.map(item => (
                                    <option value={item.value} key={item.value}>{item.text}</option>
                                ))}
                            </select>
                        </InputDiv>
                        <InputDiv>
                            <span>출발 시간대</span>
                            <select value={startTime} onChange={e => setStartTime(e.target.value)}>
                                {Array(24).fill().map((item, idx) => (
                                    <option value={idx} key={idx}>{idx} 시</option>
                                ))}
                            </select>
                            <select value={endTime} onChange={e => setEndTime(e.target.value)}>
                                {Array(24).fill().map((item, idx) => (
                                    <option value={idx} key={idx}>{idx} 시</option>
                                ))}
                            </select>
                        </InputDiv>
                    </Row>
                    <hr />
                    <CategoryTitle>
                        <div>
                            선택입력 사항
                        </div>
                    </CategoryTitle>
                    <Row>
                        <InputDiv>
                            <span>어른(만 13세이상)</span>
                            <select value={AdultCount} onChange={e => setAdultCount(Number(e.target.value))}>
                                {Array(10).fill().map((item, idx) => (
                                    <option value={idx} key={idx}>{idx} 명</option>
                                ))}
                            </select>
                        </InputDiv>
                        <InputDiv>
                            <span>어린이(만 6 ~ 12세)</span>
                            <select value={ChildrenCount} onChange={e => setChildrenCount(Number(e.target.value))}>
                                {Array(10).fill().map((item, idx) => (
                                    <option value={idx} key={idx}>{idx} 명</option>
                                ))}
                            </select>
                        </InputDiv>
                        <InputDiv>
                            <span>경로(만 65세이상)</span>
                            <select value={seniorCount} onChange={e => setSeniorCount(Number(e.target.value))}>
                                {Array(10).fill().map((item, idx) => (
                                    <option value={idx} key={idx}>{idx} 명</option>
                                ))}
                            </select>
                        </InputDiv>
                        <InputDiv>
                            <span>중증 장애인</span>
                            <select value={HeavyDisabled} onChange={e => setHeavyDisabled(Number(e.target.value))}>
                                {Array(10).fill().map((item, idx) => (
                                    <option value={idx} key={idx}>{idx} 명</option>
                                ))}
                            </select>
                        </InputDiv>
                        <InputDiv>
                            <span>경증 장애인</span>
                            <select value={LightDisabled} onChange={e => setLightDisabled(Number(e.target.value))}>
                                {Array(10).fill().map((item, idx) => (
                                    <option value={idx} key={idx}>{idx} 명</option>
                                ))}
                            </select>
                        </InputDiv>
                    </Row>
                    <Row style={{ justifyContent: 'center', marginTop: '25px' }}>
                        <SearchButton onClick={onStartMacro}>
                            조회 하기
                        </SearchButton>
                    </Row>

                </ContentsBody>
                사용 방법
                <Information>
                    <ol>
                        <li>아이디와 비밀번호 및 나머지 필수 입력 값을 입력하여 검색 버튼을 누릅니다.</li>
                        <li>검색 시작 후 몇 초뒤 새로운 브라우저가 실행되며, 이 브라우저는 외부(매크로 프로그램)의 영향을 받고 있는 브라우저라고 표시됩니다.</li>
                        <li>해당 브라우저에서 사용자가 입력한 정보를 토대로 티켓팅 사이트가 오픈되면서 자동으로 프로그램을 실행합니다.</li>
                        <li>사용자의 입력정보가 틀려서 로그인이 시도되지 않는 경우는 원활히 진행되지 않으니 반드시 티켓팅 사이트에서 회원정보를 제대로 입력해주세요.</li>
                        <li>매크로 프로그램이 돌아가는 동안 해당 프로그램이 돌아가고 있는 브라우저를 활성화 시킨채로 놔둬 주세요.</li>
                        <li>예약이 되면 사용자가 어플 또는 해당 웹사이트에서 결제하여 나머지 예매를 진행하시면 됩니다.</li>
                    </ol>
                </Information>
                안내 말씀
                <Information>
                    <ul>
                        <li style={{ color: "red" }}>매크로로 돌아가는 브라우저를 반드시 컴퓨터에 나오도록 해주십시요. 그렇지 않으면 제대로 작동안하는 경우도 있습니다.</li>
                        <li>해당 프로그램은 별도의 스토리지 없이 구성되는 프로그램이기에 입력에 사용된 사용자의 데이터는 어디에도 저장되지 않습니다.</li>
                        <li>예약 된 후 지정된 시간에 예매 하지 않아 발생하는 티켓 손실은 프로그램의 책임이 아닌 사용자 본인에게 책임이 있음을 알려드립니다.</li>
                        <li>SRT의 특실 및 입석 + 좌석은 예매하는 기능이 없습니다. 추후 추가할 예정입니다.</li>
                        <li>좌석 선택 기능은 없습니다.</li>
                        <li>본 프로그램은 nextjs와 puppeteer 라는 크롤링 라이브러리로 간단하게 만들어진 웹페이지 입니다.</li>
                    </ul>

                </Information>

            </Contents>
        </Body>
    );
}

export default MainComponent;
