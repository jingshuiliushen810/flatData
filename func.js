let monthArr = ["2019-10","2019-11","2019-12","2020-1","2020-2","2020-3","2020-4","2020-5","2020-6","2020-7","2020-8","2020-9","2020-10"];
let monthArr1 = ["2019-9","2019-10","2019-11","2019-12","2020-1","2020-2","2020-3","2020-4","2020-5","2020-6","2020-7","2020-8","2020-9","2020-10","2020-11"];

//let elec = [{
//let water

let allArr = water.concat(elec);

let allResult = dealStatisticsByType(allArr, ["GSL", "NY_FDL"], "TypeCode", monthArr, true);
let waterResult = dealStatisticsByType(water, ["GSL"], "TypeCode", monthArr, true);
let elecResult = dealStatisticsByType(elec, ["NY_FDL"], "TypeCode", monthArr1, false);
console.log("allResult", allResult);
console.log("water--GSL", waterResult);
console.log("elec--NY_FDL", elecResult);

/**
* 根据传入的类型数据处理相应类型数据的汇总信息
* @function dealStatisticsByType
* @param {Array} sourceDataArr 待处理源数组
* @param {Array} groupArr 分组的名称数组
* @param {String} groupName 指定源数组里某个字段作为分组字段
* @param {Array} monthArr 用于按传入的时间段进行分组汇总
* @param {Boolean} monthZero true:小于10月的带0，如"2020-08",false: 小于10月的不带0，如"2020-8"
* @return {Object} resultObj 
*	{
*		"实际groupName": {String} xxx,
*		"TypeName":  {String} "发电量（KWh)",
*		"classification": {Object} 分组的数据信息
*		"dateRange": {Array} 已按monthZero处理过的时间段
*		"initFlag": {Boolean} 表示是否初始化TypeName
*		"statistics": {Array} 对每个分组里各个时间段的汇总信息
*	}
**/
function dealStatisticsByType(sourceDataArr, groupArr, groupName, monthArr, monthZero) {
	let resultObj = {};
	groupArr.map((item, index) => {
		resultObj[item] = {
			"TypeName": "",
			"initFlag": false,   //是否初始化TypeName
			"statistics": [],
			"classification": {},  //存放不同月份的数据
			"dateRange": []        //存放处理后的时间字符串
		};
		resultObj[item][groupName] = item;  //分组的名称
	});

	sourceDataArr.map((item, index) => {
		let groupKey = item[groupName]
		let objItem = resultObj[groupKey];
		if(objItem) {
			if(!objItem.initFlag) {
				objItem.TypeName = item.TypeName;
				objItem.initFlag = true;
			}
			let dealDateObj = dealYearMonthStr(item.RecordTime, monthZero);
			let tempDateKey = dealDateObj["year-month"];
			if(!objItem["classification"][tempDateKey]) {
				objItem["classification"][tempDateKey] = [];
				objItem["classification"][tempDateKey].push(item.RecordValue);
			}else {
				objItem["classification"][tempDateKey].push(item.RecordValue);
			}
		}
	});

	groupArr.map((type, typeIndex) => {
		monthArr.map((item, index) => {
			let dealDateObj = dealYearMonthStr(item, monthZero);
			let tempDateKey = dealDateObj["year-month"];
			let currentObj = resultObj[type];
			currentObj["dateRange"].push(dealDateObj["year-month"]);
			const reducer = (accumulator, currentValue) => accumulator + currentValue;
			let sum = currentObj["classification"][tempDateKey] ? currentObj["classification"][tempDateKey].reduce(reducer) : 0;
			resultObj[type]["statistics"].push(sum);
		});
	});
	return resultObj;
}



/**
* 根据日期字符串返回日期的指定数据处理格式
* @function dealYearMonthStr
* @param {Boolean} monthZero 小于10月的带0，如"2020-08"
* @return {Object} {"year":2020,"month":8,"year-month":("2020-08" ||"2020-8")}
**/
function dealYearMonthStr(dateStr, monthZero) {
	let tempDate = new Date(dateStr);
	let tempDateObj = {
		"year": tempDate.getFullYear(),
		"month": tempDate.getMonth() + 1
	}
	let yearMonthStr = "";
	if(monthZero) {   
		yearMonthStr = tempDateObj["month"] < 10 ? tempDateObj["year"] + "-0" + tempDateObj["month"] : tempDateObj["year"] + "-" + tempDateObj["month"];
	}else {
		yearMonthStr = tempDateObj["year"] + "-" + tempDateObj["month"];
	}
	tempDateObj["year-month"] = yearMonthStr;
	return tempDateObj;
}







