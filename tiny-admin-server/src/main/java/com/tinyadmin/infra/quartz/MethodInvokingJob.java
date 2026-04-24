package com.tinyadmin.infra.quartz;

import java.lang.reflect.Method;
import org.quartz.Job;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

public class MethodInvokingJob implements Job {

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        JobDataMap dataMap = context.getMergedJobDataMap();
        String beanName = dataMap.getString("targetBean");
        String methodName = dataMap.getString("targetMethod");
        String args = dataMap.getString("args");
        try {
            Object bean = SpringContextHolder.getBean(beanName);
            Method method = bean.getClass().getMethod(methodName, String.class);
            method.invoke(bean, args);
        } catch (NoSuchMethodException ignored) {
            try {
                Object bean = SpringContextHolder.getBean(beanName);
                Method method = bean.getClass().getMethod(methodName);
                method.invoke(bean);
            } catch (Exception ex) {
                throw new JobExecutionException(ex);
            }
        } catch (Exception ex) {
            throw new JobExecutionException(ex);
        }
    }
}
