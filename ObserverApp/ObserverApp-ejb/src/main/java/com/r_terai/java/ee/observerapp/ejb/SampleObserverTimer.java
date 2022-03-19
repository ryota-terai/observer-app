/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.r_terai.java.ee.observerapp.ejb;

import com.r_terai.java.ee.common.entity.util.COMMONEntityUtil;
import com.r_terai.java.util.Logger;
import com.r_terai.java.ee.common.TimerEJB;
import java.util.Date;
import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.ejb.Timer;
import javax.naming.NamingException;

/**
 *
 * @author r-terai
 */
@Startup
@Singleton
public class SampleObserverTimer extends TimerEJB {

    @Override
    public void timeout(Timer timer) {
        try {
            COMMONEntityUtil.ObserverTargetUtil.kick(em, 200, (new Date()).toString(), false);
        } catch (NamingException ex) {
            logger.log(Logger.Level.SEVERE, null, ex);
        }
    }

}
