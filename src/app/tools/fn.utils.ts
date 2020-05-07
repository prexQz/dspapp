import { AbstractControl, FormControl, FormGroup, FormArray } from '@angular/forms';
import { isString, isArray } from 'util';
import { NETWORK_CONFIG } from '../services/network/network.config';

export function deepCopy(source: any, target: any) {
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (source.length && source.length > 0) {
                target[key] = {};
                deepCopy(source[key], target[key]);
            } else {
                target[key] = source[key];
            }
        }
    }
}


export function isEmpty(obj: any) {
    return obj === undefined || obj === null || (isString(obj) && obj.trim().length === 0);
}

export function isNotEmpty(obj: any) {
    return !isEmpty(obj);
}

export function toString(value: string | any): string {
    return isEmpty(value) ? '' : value.toString();
}

export function toBoolean(value: boolean | string) {
    return value === '' || (value && value !== 'false');
}


/**
 * 过滤特殊字符
 * @param source 过滤原字符串
 */
// tslint:disable-next-line:ban-types
export function filterSpecialChar(source: Object): string {
    if (!source) {
        return '';
    }
    const sourceString = source.toString();
    let sourceStringCode = '';
    let index = 0;
    let sourceStringTemp = '';
    // 处理回车符和制表符
    for (let i = 0; i < sourceString.length; i++) {
        if (sourceString.charCodeAt(i) === 10 || sourceString.charCodeAt(i) === 9) {
            sourceStringCode = sourceStringCode + sourceString.substring(index, i);
            index = i + 1;
        }
    }
    sourceStringCode = sourceStringCode + sourceString.substring(index, sourceString.length);
    const temp = sourceStringCode.split('\\');
    if (temp.length === 0) {
        return sourceStringCode;
    }
    // 处理转义符
    for (let i = 0; i < temp.length; i++) {
        if (i === temp.length - 1) {
            sourceStringTemp = sourceStringTemp + temp[i];
        } else {
            sourceStringTemp = sourceStringTemp + temp[i] + '\\\\';
        }
    }
    return sourceStringTemp;
}

// 判断字符串字节长度 汉字及全角符号占3
function calcByteLength(str: string, num: number = 3) {
    if (str === null || str === undefined) {
        return 0;
    }
    let nstr = '';
    while (num > 0) {
        nstr += '0';
        num--;
    }
    return (str + '').replace(/[^\x00-\xff]/g, nstr).length;
}

/**
 * 根据指定长度截取字符串
 */
export function cutString(str: string, length: number) {
    let tempStr = str;
    let num = 0;
    let str1 = '';
    for (let i = 0; i < tempStr.length; i++) {
        num += calcByteLength(tempStr[i]);
        if (num > length) {
            break;
        } else {
            str1 = tempStr.substring(0, i + 1);
        }
    }
    return str1;
}

/**
 *  格式化日期
 * @param date
 * @param {string} fmt
 * @returns {any}
 */
export function formatDate(date, fmt: string = 'yyyy-MM-dd') {
    if (date instanceof Date) {
        const o = {
            'M+': date.getMonth() + 1, // 月份
            'd+': date.getDate(), // 日
            'h+': date.getHours(), // 小时
            'm+': date.getMinutes(), // 分
            's+': date.getSeconds(), // 秒
            'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
            'S': date.getMilliseconds() // 毫秒
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        for (const k in o) {
            if (new RegExp('(' + k + ')').test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
            }
        }
        return fmt;
    }
    console.warn('formatDate: ' + date + '不是正确的Date类型');
    return date;
}

/**
 * 日期+天数得到新日期
 * @param date 日期
 * @param days 天数
 * @param isInclude 是否包含当天
 */
export function addDate(date, days, isInclude?: boolean) {
    const d = new Date(date);
    if (isInclude) {
        d.setDate(d.getDate() + days - 1);
    } else {
        d.setDate(d.getDate() + days);
    }
    const m = d.getMonth() + 1;
    return d.getFullYear() + '-' + m + '-' + d.getDate();
}

/**
 * 表单校验
 * @param form 
 */
export function makeFormDirty(form: AbstractControl) {
    const controls = (form as FormGroup).controls;
    Object.keys(controls).forEach(key => {
        const obj = controls[key];
        if (obj instanceof FormControl) {
            obj.markAsDirty();
            obj.updateValueAndValidity();
            // if (!obj.valid) {
            //     console.log('!valid' + key);
            // }
        } else if (obj instanceof FormArray) {
            obj.controls.forEach(sonCon => {
                makeFormDirty(sonCon);
            });
        } else if (obj instanceof FormGroup) {
            makeFormDirty(obj);
        }
    });
}

export function openNewWindow(url: string) {
    window.open(url, '_blank');
    // window.open(NETWORK_CONFIG.domian + url, '_blank');
}

export function tempCheck(): boolean {
    this.roleData = JSON.parse(localStorage.getItem('roleData'));
    let isEdit: string;
    // console.log(this.roleData);
    for (let i: any = 0; i < this.roleData.length; i++) {
        if (this.roleData[i].menuBar == 'caches') {
            isEdit = this.roleData[i].isEdit;
        }
    }
    if (isEdit == 'Y') {
        return true;
    } else {
        return false;
    }
}

export function authCheck(): string {
    let arr = '';
    // console.log(localStorage.getItem('roleData'));
    const roleData = JSON.parse(localStorage.getItem('roleData'));
    const userData = JSON.parse(localStorage.getItem('userInfo'));
    for (let i: any = 0; i < roleData.length; i++) {
        if (roleData[i].isSee === 'Y') {
            if (arr) {
                if (i == roleData.length - 1) {
                    arr += roleData[i].menuBar;
                } else {
                    arr += roleData[i].menuBar + ',';
                }
            } else {
                arr += roleData[i].menuBar;
            }
        }
    }
    if (!arr) {
        if (userData.userRole !== 'SuperAdministrators') {
            arr = 'NOAUTH';
        }
    }
    return arr;
}

/**
 * 编码key等输入校验
 */
export function checkCode(value: string): boolean {
    const regNex = /^[a-zA-Z]+\-?\w*$/;
    if (regNex.test(value)) {
        return false;
    }
    return true;
}


/**
 * 密码强度校验
 * @param pswd 密码
 */
export function checkPswd(pswd: string) {
    let resultMsg = '';
    const number = /[0-9]/; // 判断是否含有数字
    const upletter = /[A-Z]/; // 判断是否含有大写字母
    const lowerletter = /[a-z]/;  // 判断是否含有小写字母
    const reg = /^[0-9a-zA-Z]{8,15}$/;  // 长度校验
    if (reg.test(pswd)) {
        let flag = false;
        if (!number.test(pswd)) {
            flag = true;
        }
        if (!upletter.test(pswd)) {
            flag = true;
        }
        if (!lowerletter.test(pswd)) {
            flag = true;
        }
        if (flag) {
            resultMsg = '必须包含大小写字母、数字';
        }
    } else {
        resultMsg = '长度不少于8个字符，不超过15个字符';
    }
    return resultMsg;
}

/**
 * 手机号码校验
 */
export function checkPhone(phone) {
    let resultMsg = '';
    const reg = /^1[3|4|5|7|8][0-9]{9}$/;
    if (!reg.test(phone)) {
        resultMsg = '联系方式格式有误';
    }
    return resultMsg;
}

/**
 * 邮箱校验
 * @param email 邮箱地址
 */
export function checkMail(email) {
    let resultMsg = '';
    const reg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
    if (!reg.test(email)) {
        resultMsg = '邮箱填写格式有误';
    }
    return resultMsg;
}

export function getUUid(){
    let timestamp = new Date().getTime();
    let x = "0123456789qwertyuioplkjhgfdsazxcvbnm";
    let tmp = "";
    for (let i = 0; i < 20 ; i++)  {
        tmp  +=  x.charAt(Math.ceil(Math.random() * 100000000) % x.length);
    }
    return  timestamp + tmp; 
}
